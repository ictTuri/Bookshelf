import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../service/message/message.service';
import {
  DtoMessageResponse,
  DtoMessageRequest,
  DtoConversationResponse,
  DtoReplySnippet,
} from '../../interfaces/message.interface';
import { PageResponse } from '../../interfaces/page.interface';
import { Subscription, map, Observable } from 'rxjs';
import { ThemeService } from '../../service/theme/theme.service';
import { AuthStateService } from '../../service/auth/auth-state.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  standalone: false,
})
export class MessagesComponent implements OnInit, OnDestroy {
  friendId: number | null = null;
  activeConversationId: number | null = null;
  friendName = '';
  activeFriendEmail = '';
  activeFriendProfilePic: string | null = null;

  conversations: DtoConversationResponse[] = [];
  conversationsLoading = false;

  messages: DtoMessageResponse[] = [];
  messagesLoading = false;
  messageText = '';
  sendingMessage = false;
  replyingTo: DtoReplySnippet | null = null;
  currentPage = 0;
  pageSize = 50;
  totalPages = 0;
  selectedFile: File | null = null;
  selectedFilePreview: string | null = null;
  zoomedImage: string | null = null;
  isSidebarCollapsed = false;

  editingMessageId: number | null = null;
  editMessageText = '';
  showReactionPickerId: number | null = null;
  showFullPicker = false;

  // Mobile long-press
  mobileOptionsMessageId: number | null = null;
  mobileOptionsPosition: 'above' | 'below' = 'above';
  mobileShowReactions = false;
  private touchTimer: any;
  private longPressDuration = 500; // ms

  isDarkMode$: Observable<boolean>;

  @ViewChild('messageInput') messageInput!: ElementRef<HTMLInputElement>;

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private themeService: ThemeService,
    private authStateService: AuthStateService,
    private cdr: ChangeDetectorRef
  ) {
    this.isDarkMode$ = this.themeService.theme$.pipe(map(t => t === 'dark'));
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showReactionPickerId !== null) {
      const target = event.target as HTMLElement;
      if (!target.closest('.reaction-picker-container') && !target.closest('.message-action-btn')) {
        this.showReactionPickerId = null;
        this.showFullPicker = false;
      }
    }
    if (this.mobileOptionsMessageId !== null) {
       const target = event.target as HTMLElement;
       if (!target.closest('.mobile-message-options') && !target.closest('.message-bubble')) {
         this.closeMobileOptions();
       }
    }
  }

  onTouchStart(event: TouchEvent, messageId: number): void {
    const target = event.target as HTMLElement;
    if (target.closest('.mobile-message-options') || 
        target.closest('.reaction-picker-container') ||
        target.closest('.add-reaction-inline')) {
      return;
    }

    const touch = event.touches[0];
    const viewHeight = window.innerHeight;
    // If message is in the top 40% of screen, show options below it
    this.mobileOptionsPosition = touch.clientY < (viewHeight * 0.4) ? 'below' : 'above';

    this.touchTimer = setTimeout(() => {
      this.mobileOptionsMessageId = messageId;
      this.mobileShowReactions = false;
      // Vibrate if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      this.cdr.detectChanges();
    }, this.longPressDuration);
  }

  onTouchEnd(): void {
    if (this.touchTimer) {
      clearTimeout(this.touchTimer);
    }
  }

  onTouchMove(): void {
    if (this.touchTimer) {
      clearTimeout(this.touchTimer);
    }
  }

  closeMobileOptions(): void {
    this.mobileOptionsMessageId = null;
    this.mobileShowReactions = false;
  }

  onMobileAction(action: 'react' | 'reply' | 'edit' | 'delete', msg: DtoMessageResponse): void {
    this.closeMobileOptions();
    switch (action) {
      case 'react':
        this.toggleReactionPicker(msg.id);
        break;
      case 'reply':
        this.setReply(msg);
        this.messageInput.nativeElement.focus();
        break;
      case 'edit':
        this.startEdit(msg);
        break;
      case 'delete':
        this.deleteMessage(msg.id);
        break;
    }
  }

  ngOnInit(): void {
    // Ensure SSE is connected
    this.messageService.connectSSE();

    this.loadConversations();

    // Monitor connection state
    this.subs.push(this.messageService.isConnected$.subscribe(connected => {
      console.log('SSE: Connection status in MessagesComponent:', connected ? 'Connected' : 'Disconnected');
    }));

    // Get friendId from query params
    const sub = this.route.queryParams.subscribe((params) => {
      const rawFriendId = params['friendId'];
      const parsedFriendId = Number(rawFriendId);
      const newFriendId = Number.isFinite(parsedFriendId) && parsedFriendId > 0 ? parsedFriendId : null;

      if (newFriendId !== this.friendId) {
        console.log('SSE: Switching to friend:', newFriendId);
        this.friendId = newFriendId;
        this.activeConversationId = null; // Reset until loaded
        
        if (this.friendId) {
          this.updateActiveFriendName();
          this.loadMessages(0);
        } else {
          this.messages = [];
        }
      }
    });
    this.subs.push(sub);

    // Listen to incoming messages and updates
    const msgSub = this.messageService.message$.subscribe((msg) => {
      console.log('SSE: Incoming real-time event:', msg);
      
      // Update the conversation sidebar locally
      this._applyIncomingToSidebar(msg);

      // Determine if this event belongs to the currently open chat
      const isForActiveConvo = this.activeConversationId !== null && msg.conversationId === this.activeConversationId;
      const isFromActiveFriend = this.friendId !== null && msg.senderId === this.friendId;

      if (isForActiveConvo || isFromActiveFriend) {
        const existingIdx = this.messages.findIndex((m) => m.id === msg.id);
        
        if (existingIdx >= 0) {
          console.log('SSE: Updating existing message:', msg.id);
          this.messages = this.messages.map(m => m.id === msg.id ? { ...msg } : m);
        } else {
          console.log('SSE: Adding new message:', msg.id);
          this.messages = [...this.messages, msg];
          this.scrollToBottom();

          // Ensure activeConversationId is synced
          if (!this.activeConversationId) {
            this.activeConversationId = msg.conversationId;
          }

          // Auto-mark as read
          if (msg.senderId === this.friendId) {
            this.messageService.markAsRead(msg.id).subscribe();
          }
        }
        this.cdr.detectChanges();
      }
    });
    this.subs.push(msgSub);

    // Listen to read notifications
    const readSub = this.messageService.messageRead$.subscribe((msg) => {
      console.log('SSE: Message read:', msg.id);
      const idx = this.messages.findIndex((m) => m.id === msg.id);
      if (idx >= 0) {
        this.messages = this.messages.map(m => m.id === msg.id ? { ...m, read: true } : m);
        this.cdr.detectChanges();
      }
    });
    this.subs.push(readSub);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  private loadConversations(): void {
    this.conversationsLoading = true;
    this.messageService.getConversations(0, 30).subscribe({
      next: (response: PageResponse<DtoConversationResponse>) => {
        this.conversations = [...response.content];
        this.conversationsLoading = false;

        // Cache the active conversation ID for SSE matching
        const active = this.conversations.find((c) => c.friendId === this.friendId);
        this.activeConversationId = active?.conversationId ?? null;

        // If no conversation selected, default to first one.
        if (!this.friendId && this.conversations.length > 0) {
          this.openConversation(this.conversations[0]);
          return;
        }

        this.updateActiveFriendName();
        this.cdr.detectChanges();
      },
      error: () => {
        this.conversationsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadMessages(page: number): void {
    if (!this.friendId) return;

    this.messagesLoading = true;
    this.messageService.getMessages(this.friendId, page, this.pageSize).subscribe({
      next: (response: PageResponse<DtoMessageResponse>) => {
        if (page === 0) {
          this.messages = [...response.content];
        } else {
          this.messages = [...response.content, ...this.messages];
        }
        this.totalPages = response.totalPages;
        this.currentPage = response.number;
        this.messagesLoading = false;
        this.scrollToBottom();

        // After loading messages (which marks them as read), zero out unreadCount locally
        const idx = this.conversations.findIndex(c => c.friendId === this.friendId);
        if (idx >= 0) {
          const newConvs = [...this.conversations];
          newConvs[idx] = { ...newConvs[idx], unreadCount: 0 };
          this.conversations = newConvs;
        }
        // Notify other components (like Navbar) to refresh their badges
        this.messageService.notifyUnreadCountChanged();
        this.cdr.detectChanges();
      },
      error: () => {
        this.messagesLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  setReply(msg: DtoMessageResponse): void {
    this.replyingTo = {
      id: msg.id,
      senderId: msg.senderId,
      senderName: msg.senderName,
      contentSnippet: msg.content.length > 80 ? msg.content.slice(0, 80) + '…' : msg.content,
    };
  }

  cancelReply(): void {
    this.replyingTo = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Create preview if it's an image
      if (this.selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedFilePreview = e.target?.result as string;
        };
        reader.readAsDataURL(this.selectedFile);
      } else {
        this.selectedFilePreview = null;
      }
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.selectedFilePreview = null;
  }

  sendMessage(): void {
    // If we are in edit mode, route to saveEdit instead
    if (this.editingMessageId !== null) {
      this.saveEdit();
      return;
    }

    const hasText = this.messageText.trim().length > 0;
    const hasFile = !!this.selectedFile;

    if (!this.friendId || (!hasText && !hasFile)) return;

    this.sendingMessage = true;
    const request: DtoMessageRequest & { media?: File | null } = {
      content: this.messageText.trim(),
      replyToId: this.replyingTo?.id ?? null,
      media: this.selectedFile,
    };

    this.messageService.sendMessage(this.friendId, request).subscribe({
      next: (msg) => {
        this.messages = [...this.messages, msg];
        
        // Update sidebar preview immediately for the sender
        this._applyIncomingToSidebar(msg);

        // Keep activeConversationId in sync for first message in a new convo
        if (!this.activeConversationId) {
          this.activeConversationId = msg.conversationId;
        }
        this.messageText = '';
        this.replyingTo = null;
        this.removeSelectedFile();
        this.sendingMessage = false;
        this.scrollToBottom();

        // Auto-focus the input again
        setTimeout(() => {
          this.messageInput?.nativeElement.focus();
        }, 0);

        this.cdr.detectChanges();
      },
      error: () => {
        this.sendingMessage = false;
      },
    });
  }

  openConversation(conversation: DtoConversationResponse): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { friendId: conversation.friendId },
      queryParamsHandling: 'merge',
    });
  }

  isActiveConversation(friendId: number): boolean {
    return this.friendId === friendId;
  }

  deleteMessage(messageId: number): void {
    if (!confirm('Delete this message?')) return;

    this.messageService.deleteMessage(messageId).subscribe({
      next: () => {
        this.messages = this.messages.filter((m) => m.id !== messageId);
        this.cdr.detectChanges();
      },
    });
  }

  loadOlderMessages(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.loadMessages(this.currentPage + 1);
    }
  }

  trackByConversationId(_: number, conv: DtoConversationResponse): number {
    return conv.conversationId;
  }

  private updateActiveFriendName(): void {
    if (!this.friendId) {
      this.friendName = '';
      this.activeFriendEmail = '';
      this.activeFriendProfilePic = null;
      return;
    }

    const activeConversation = this.conversations.find((c) => c.friendId === this.friendId);
    this.friendName = activeConversation?.friendName ?? 'Chat';
    this.activeFriendEmail = activeConversation?.friendEmail ?? '';
    this.activeFriendProfilePic = activeConversation?.friendProfilePic ?? null;
    this.cdr.detectChanges();
  }

  getConversationInitials(conv: DtoConversationResponse): string {
    if (conv.friendName?.trim()) {
      const parts = conv.friendName.trim().split(/\s+/);
      if (parts.length === 1) return parts[0][0].toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return conv.friendEmail ? conv.friendEmail[0].toUpperCase() : '?';
  }

  getUserInitials(fullName: string | undefined | null, email: string): string {
    if (fullName?.trim()) {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length === 1) return parts[0][0].toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return email ? email[0].toUpperCase() : '?';
  }

  /** Update conversation sidebar in-place from an incoming SSE message (no HTTP call). */
  private _applyIncomingToSidebar(msg: DtoMessageResponse): void {
    const idx = this.conversations.findIndex((c) => c.conversationId === msg.conversationId);
    if (idx < 0) {
      // New conversation not yet in list — reload to get it
      console.log('New conversation detected via SSE, reloading list...');
      this.loadConversations();
      return;
    }

    const conv = this.conversations[idx];
    const isActive = conv.conversationId === this.activeConversationId;

    const newConvs = [...this.conversations];
    newConvs[idx] = {
      ...conv,
      lastMessagePreview: msg.content,
      lastMessageAt: msg.createdAt,
      unreadCount: isActive ? 0 : conv.unreadCount + 1,
    };

    if (isActive) {
      this.messageService.notifyUnreadCountChanged();
    }

    // Bubble updated conversation to the top
    const updated = newConvs.splice(idx, 1)[0];
    newConvs.unshift(updated);
    this.conversations = newConvs;
    this.cdr.detectChanges();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  timeAgo(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    if (h < 24) return rem > 0 ? `${h}h ${rem}m ago` : `${h}h ago`;
    const d = Math.floor(h / 24);
    const remH = h % 24;
    return remH > 0 ? `${d}d ${remH}h ago` : `${d}d ago`;
  }

  zoomImage(data: string): void {
    this.zoomedImage = data;
  }

  closeZoom(): void {
    this.zoomedImage = null;
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  startEdit(msg: DtoMessageResponse): void {
    this.editingMessageId = msg.id;
    this.messageText = msg.content;
    this.replyingTo = null; // Clear reply if editing
    this.removeSelectedFile(); // Clear file if editing
    
    // Auto-focus the input
    setTimeout(() => {
      this.messageInput?.nativeElement.focus();
    }, 0);
  }

  cancelEdit(): void {
    this.editingMessageId = null;
    this.messageText = '';
    this.cdr.detectChanges();
  }

  saveEdit(): void {
    if (this.editingMessageId === null || !this.messageText.trim()) return;

    this.messageService
      .updateMessage(this.editingMessageId, {
        content: this.messageText.trim(),
        edited: true,
      })
      .subscribe({
        next: (updated) => {
          this.messages = this.messages.map(m => m.id === updated.id ? { ...updated } : m);
          this.cancelEdit();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to save message edit:', err);
        }
      });
  }

  toggleReactionPicker(messageId: number): void {
    if (this.showReactionPickerId !== messageId) {
      this.showReactionPickerId = messageId;
      this.showFullPicker = false;
    } else {
      this.showReactionPickerId = null;
    }
  }

  toggleFullPicker(): void {
    this.showFullPicker = !this.showFullPicker;
  }

  addQuickReaction(emoji: string, messageId: number): void {
    this.addReaction({ native: emoji }, messageId);
  }

  addReaction(event: any, messageId: number): void {
    const emoji = event.native || (event.emoji && event.emoji.native) || (typeof event === 'string' ? event : null);
    
    if (!emoji) return;

    const currentUser = this.authStateService.getCurrentUser();
    const email = currentUser?.email;

    if (!email) {
      console.warn('SSE: User email not found.');
      return;
    }

    const message = this.messages.find(m => m.id === messageId);
    const existingReactions = message?.reactions || {};

    // Merge: key is email, value is emoji.
    const updatedReactions = {
      ...existingReactions,
      [email]: emoji
    };

    console.log('SSE: Sending merged reactions:', updatedReactions);

    this.messageService.updateMessage(messageId, { reactions: updatedReactions }).subscribe({
      next: (updated) => {
        this.messages = this.messages.map(m => m.id === updated.id ? { ...updated } : m);
        this.showReactionPickerId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('SSE: Reaction update failed:', err);
      }
    });
  }

  getReactionEntries(reactions: Record<string, string> | undefined): [string, string][] {
    if (!reactions) return [];
    
    // In the new format, reactions is Record<email, emoji>.
    // We aggregate by the value (the emoji) to show counts.
    const aggregated: Record<string, number> = {};
    Object.values(reactions).forEach(emoji => {
      aggregated[emoji] = (aggregated[emoji] || 0) + 1;
    });

    return Object.entries(aggregated).map(([emoji, count]) => [emoji, count.toString()]);
  }
}
