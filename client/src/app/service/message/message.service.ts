import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';
import {
  DtoMessageResponse,
  DtoConversationResponse,
  DtoMessageRequest,
  DtoMessageUpdateRequest,
} from '../../interfaces/message.interface';
import { PageResponse } from '../../interfaces/page.interface';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { AuthStateService } from '../auth/auth-state.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private apiUrl = `${environment.apiUrl}/messages`;
  private sseEmitter: EventSource | EventSourcePolyfill | null = null;
  private messageSubject = new Subject<DtoMessageResponse>();
  private messageReadSubject = new Subject<DtoMessageResponse>();
  private connectionStateSubject = new BehaviorSubject<boolean>(false);

  /** Emits every incoming message received via SSE. */
  public message$ = this.messageSubject.asObservable();
  /** Emits whenever a message is marked read via SSE. */
  public messageRead$ = this.messageReadSubject.asObservable();
  /** Emits true when SSE is connected, false otherwise. */
  public isConnected$ = this.connectionStateSubject.asObservable();

  private refreshUnreadCountSubject = new Subject<void>();
  /** Emits when components should refresh their unread conversation counts. */
  public refreshUnreadCount$ = this.refreshUnreadCountSubject.asObservable();

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 2000;   // start at 2 s
  private readonly maxDelay = 60000; // cap at 60 s
  private intentionalDisconnect = false;

  constructor(
    private http: HttpClient,
    private authState: AuthStateService,
    private ngZone: NgZone
  ) {}

  /**
   * Establish SSE connection for real-time messaging.
   * Automatically reconnects with exponential back-off on failure.
   * Call this once on login; call disconnectSSE() on logout.
   */
  connectSSE(): void {
    if (this.sseEmitter) {
      console.log('SSE: Already connected. Status:', this.sseEmitter.readyState);
      return;
    }

    this.intentionalDisconnect = false;
    console.log('SSE: Initiating connection...');
    this._openSSE();
  }

  private _openSSE(): void {
    const token = this.authState.getCurrentUser()?.token;
    if (!token) {
      console.warn('SSE: No token available, aborting connection.');
      this.connectionStateSubject.next(false);
      return;
    }

    const sseUrl = `${this.apiUrl}/connect`;
    
    if (token) {
      this.sseEmitter = new EventSourcePolyfill(sseUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
        },
        withCredentials: true,
        heartbeatTimeout: 120000,
      });
    } else {
      this.sseEmitter = new EventSource(sseUrl, {
        withCredentials: true,
      });
    }

    this.sseEmitter.onopen = () => {
      console.log('SSE: Connection established successfully.');
      this.connectionStateSubject.next(true);
      this.reconnectDelay = 2000;
    };

    // Named event listeners
    const eventTypes = ['NEW_MESSAGE', 'MESSAGE_READ', 'MESSAGE_UPDATED'];
    eventTypes.forEach(type => {
      this.sseEmitter?.addEventListener(type, (event: MessageEvent<string>) => {
        if (type === 'MESSAGE_READ') {
          this._handleIncomingRead(event.data);
        } else {
          this._handleIncomingMessage(event.data, type);
        }
      });
    });

    // Catch-all for any event named 'message'
    this.sseEmitter.addEventListener('message', (event: MessageEvent<string>) => {
      console.log('SSE: Received generic "message" event:', event.data);
      this._handleIncomingMessage(event.data, 'GENERIC_MESSAGE_EVENT');
    });

    // Ignore heartbeat
    this.sseEmitter.addEventListener('heartbeat', () => {
      // Keep-alive comment from BE, do nothing.
    });

    // Fallback for generic messages via onmessage property
    this.sseEmitter.onmessage = (event: MessageEvent<string>) => {
      console.log('SSE: Received data via onmessage:', event.data);
      this._handleIncomingMessage(event.data, 'ONMESSAGE_CALLBACK');
    };

    this.sseEmitter.onerror = (error) => {
      console.error('SSE: Connection error occurred:', error);
      this.connectionStateSubject.next(false);
      this.sseEmitter?.close();
      this.sseEmitter = null;

      if (!this.intentionalDisconnect) {
        console.log(`SSE: Attempting reconnect in ${this.reconnectDelay}ms...`);
        this._scheduleReconnect();
      }
    };
  }

  private _handleIncomingMessage(data: string, source: string): void {
    try {
      const message = JSON.parse(data) as DtoMessageResponse;
      console.log(`SSE: Received message via ${source}:`, message.id);
      this.ngZone.run(() => {
        this.messageSubject.next(message);
      });
    } catch (error) {
      console.error('SSE: Failed to parse incoming message data:', error);
    }
  }

  private _handleIncomingRead(data: string): void {
    try {
      const message = JSON.parse(data) as DtoMessageResponse;
      console.log('SSE: Received read notification:', message.id);
      this.ngZone.run(() => {
        this.messageReadSubject.next(message);
      });
    } catch (error) {
      console.error('SSE: Failed to parse read notification data:', error);
    }
  }

  private _scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.intentionalDisconnect) {
        this._openSSE();
        // Double the delay for next failure, capped at maxDelay
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxDelay);
      }
    }, this.reconnectDelay);
  }

  /**
   * Close SSE connection permanently (call on logout).
   */
  disconnectSSE(): void {
    this.intentionalDisconnect = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.sseEmitter) {
      this.sseEmitter.close();
      this.sseEmitter = null;
    }
    this.reconnectDelay = 2000;
  }

  /**
   * Send a message to a friend.
   */
  sendMessage(
    friendId: number,
    request: DtoMessageRequest & { media?: File | null }
  ): Observable<DtoMessageResponse> {
    const formData = new FormData();
    formData.append('content', request.content);
    if (request.replyToId) formData.append('replyToId', request.replyToId.toString());
    if (request.media) formData.append('media', request.media);
    return this.http.post<DtoMessageResponse>(
      `${this.apiUrl}/${friendId}`,
      formData
    );
  }

  /**
   * Get all conversations (inbox) for the current user.
   */
  getConversations(
    page: number = 0,
    size: number = 20
  ): Observable<PageResponse<DtoConversationResponse>> {
    return this.http.get<PageResponse<DtoConversationResponse>>(
      `${this.apiUrl}/conversations`,
      {
        params: { page: page.toString(), size: size.toString() },
      }
    );
  }

  /**
   * Get message history with a specific friend.
   * Automatically marks unread messages from the friend as read.
   */
  getMessages(
    friendId: number,
    page: number = 0,
    size: number = 50
  ): Observable<PageResponse<DtoMessageResponse>> {
    return this.http.get<PageResponse<DtoMessageResponse>>(
      `${this.apiUrl}/conversations/${friendId}`,
      {
        params: { page: page.toString(), size: size.toString() },
      }
    );
  }

  /**
   * Mark a message as read.
   */
  markAsRead(messageId: number): Observable<DtoMessageResponse> {
    return this.http.patch<DtoMessageResponse>(
      `${this.apiUrl}/${messageId}/read`,
      {}
    );
  }

  /**
   * Returns the number of conversations with unread messages.
   */
  getUnreadConversationCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/conversations/unread-count`);
  }

  /**
   * Notifies all subscribers that the unread count has changed.
   */
  notifyUnreadCountChanged(): void {
    this.refreshUnreadCountSubject.next();
  }

  /**
   * Delete a message (sender only).
   */
  deleteMessage(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${messageId}`);
  }

  /**
   * Update a message (edit content or react).
   */
  updateMessage(
    messageId: number,
    request: DtoMessageUpdateRequest
  ): Observable<DtoMessageResponse> {
    return this.http.patch<DtoMessageResponse>(
      `${this.apiUrl}/${messageId}`,
      request
    );
  }
}
