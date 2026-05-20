import { Component, HostListener, Inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Subscription, interval } from 'rxjs';
import { Router } from '@angular/router';
import { AuthStateService, AuthUser } from '../../service/auth/auth-state.service';
import { ProfileService } from '../../service/profile/profile.service';
import { NotificationService } from '../../service/notification/notification.service';
import { MessageService } from '../../service/message/message.service';
import { ThemeService, Theme } from '../../service/theme/theme.service';
import { DtoNotificationResponse } from '../../interfaces/notification.interface';
import { DtoConversationResponse } from '../../interfaces/message.interface';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  standalone: false
})
export class NavComponent implements OnInit, OnDestroy {
  user$: Observable<any>;
  isBrowser: boolean;
  currentUser: AuthUser | null = null;
  currentTheme$: Observable<Theme>;

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  showAddBookPopup = false;
  showNotifications = false;
  showMessages = false;
  showProfileMenu = false;
  showNavMenu = false;
  profilePictureUrl: string | null = null;

  notifications: DtoNotificationResponse[] = [];
  notificationsLoading = false;
  unreadCount = 0;

  conversations: DtoConversationResponse[] = [];
  conversationsLoading = false;
  unreadConversationsCount = 0;

  get isAuthRoute(): boolean {
    const url = this.router.url;
    return url.startsWith('/auth') || url === '/auth' || url.includes('/auth/');
  }

  get isLandingPage(): boolean {
    const url = this.router.url;
    return url === '/' || url.startsWith('/about') || url.startsWith('/feedback');
  }

  private userSub!: Subscription;
  private pollSub?: Subscription;
  private messageSubs: Subscription[] = [];

  toggleNavMenu(): void {
    this.showNavMenu = !this.showNavMenu;
    this.showNotifications = false;
    this.showProfileMenu = false;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showMessages = false;
    this.showProfileMenu = false;
    this.showNavMenu = false;
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  toggleMessages(): void {
    this.showMessages = !this.showMessages;
    this.showNotifications = false;
    this.showProfileMenu = false;
    this.showNavMenu = false;
    if (this.showMessages) {
      this.loadConversations();
    }
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.showNotifications = false;
    this.showMessages = false;
    this.showNavMenu = false;
  }

  onNotifClick(event: MouseEvent, n: DtoNotificationResponse): void {
    event.stopPropagation(); // prevent HostListener from firing
    // Mark as read
    if (!n.read) {
      this.notificationService.markAsRead(n.id).subscribe({
        next: (updated) => {
          const idx = this.notifications.findIndex(x => x.id === updated.id);
          if (idx >= 0) this.notifications[idx] = updated;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      });
    }
    // Close dropdown then navigate
    this.showNotifications = false;
    if (n.referenceId && n.referenceType) {
      this.navigateToRef(n);
    }
  }

  markRead(n: DtoNotificationResponse): void {
    this.onNotifClick(new MouseEvent('click'), n);
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map(n => ({ ...n, read: true }));
        this.unreadCount = 0;
      }
    });
  }

  deleteNotification(event: MouseEvent, n: DtoNotificationResponse): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(n.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(x => x.id !== n.id);
        if (!n.read) this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    });
  }

  clearAllNotifications(): void {
    this.notificationService.clearAll().subscribe({
      next: () => {
        this.notifications = [];
        this.unreadCount = 0;
      }
    });
  }

  navigateToRef(n: DtoNotificationResponse): void {
    const type = n.type.toUpperCase();
    const refType = n.referenceType?.toUpperCase();
    const id = n.referenceId;

    if (refType === 'FRIEND_REQUEST') {
      this.router.navigate(['/friends']);
      return;
    }

    if (!id || !refType) return;

    if (refType === 'POST') {
      this.router.navigate(['/home'], { queryParams: { postId: id } });
    } else if (refType === 'COMMENT') {
      // Comments belong to a post — navigate to home with the post ID
      this.router.navigate(['/home'], { queryParams: { postId: id } });
    } else if (refType === 'FEEDBACK') {
      this.router.navigate(['/feedback'], { queryParams: { feedbackId: id } });
    } else if (refType === 'BOOK') {
      this.router.navigate(['/mybooks']);
    }
  }

  getNotifIcon(type: string): string {
    const map: Record<string, string> = {
      BOOK_BORROWED: 'fa-book-reader',
      BOOK_RETURNED: 'fa-undo',
      BOOK_REQUEST: 'fa-hand-paper',
      REQUEST_APPROVED: 'fa-check-circle',
      REQUEST_REJECTED: 'fa-times-circle',
      NEW_FOLLOWER: 'fa-user-plus',
      POST_LIKE: 'fa-heart',
      POST_COMMENT: 'fa-comment',
      FEEDBACK_COMMENTED: 'fa-comment-dots',
      SYSTEM: 'fa-info-circle',
      FRIEND_REQUEST_ACCEPTED: 'fa-user-check'
    };
    return map[type] ?? 'fa-bell';
  }

  /** Returns { source, summary } for display in the notification item */
  getNotifDisplay(n: DtoNotificationResponse): { source: string; summary: string } {
    const actor = n.actorName?.split(' ')[0] ?? 'Someone'; // first name only

    const map: Record<string, { source: string; summary: string }> = {
      FEEDBACK_COMMENTED: { source: 'Feedback',  summary: `${actor} left a comment` },
      POST_LIKE:          { source: 'Home',       summary: `${actor} liked your post` },
      POST_COMMENT:       { source: 'Home',       summary: `${actor} commented on your post` },
      NEW_FOLLOWER:       { source: 'Community',  summary: `${actor} started following you` },
      FRIEND_REQUEST_ACCEPTED: { source: 'Friends', summary: `${actor} accepted your friend request` },
      BOOK_BORROWED:      { source: 'Library',    summary: `${actor} borrowed your book` },
      BOOK_RETURNED:      { source: 'Library',    summary: `${actor} returned your book` },
      BOOK_REQUEST:       { source: 'Library',    summary: `${actor} requested your book` },
      REQUEST_APPROVED:      { source: 'Library',    summary: `${actor} approved your borrow request` },
      REQUEST_REJECTED:      { source: 'Library',    summary: `${actor} declined your borrow request` },
      BOOK_BORROW_REJECTED:  { source: 'Library',    summary: `${actor} declined your borrow request` },
      SYSTEM:             { source: 'System',     summary: n.message },
    };

    return map[n.type] ?? { source: 'Bookshelf', summary: n.message };
  }

  timeAgo(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-wrapper')) this.showNotifications = false;
    if (!target.closest('.message-wrapper')) this.showMessages = false;
    if (!target.closest('.profile-wrapper')) this.showProfileMenu = false;
    if (!target.closest('.nav-brand-wrapper')) this.showNavMenu = false;
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthStateService,
    private router: Router,
    private profileService: ProfileService,
    private notificationService: NotificationService,
    private messageService: MessageService,
    private themeService: ThemeService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.user$ = this.authService.user$;
    this.currentTheme$ = this.themeService.theme$;
  }

  ngOnInit(): void {
    this.userSub = this.authService.user$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.ensureUserFullName(user);
        this.loadProfilePicture();
        this.fetchUnreadCount();
        // Connect to SSE for real-time messaging
        this.messageService.connectSSE();
        // Subscribe to incoming messages and read events
        const msgSub = this.messageService.message$.subscribe((msg) => {
          this.refreshConversations();
        });
        const readSub = this.messageService.messageRead$.subscribe((msg) => {
          this.refreshConversations();
        });
        this.messageSubs.push(msgSub, readSub);
        // Poll unread count every 30 seconds
        this.pollSub = interval(30_000).subscribe(() => this.fetchUnreadCount());

        // Refresh count on demand
        const refreshSub = this.messageService.refreshUnreadCount$.subscribe(() => {
          this.fetchUnreadCount();
        });
        this.messageSubs.push(refreshSub);

        // Listen for profile picture updates
        const profilePicSub = this.profileService.profilePictureUpdated$.subscribe(() => {
          this.loadProfilePicture();
        });
        this.messageSubs.push(profilePicSub);
      } else {
        if (this.profilePictureUrl) URL.revokeObjectURL(this.profilePictureUrl);
        this.profilePictureUrl = null;
        this.notifications = [];
        this.unreadCount = 0;
        this.conversations = [];
        this.unreadConversationsCount = 0;
        this.pollSub?.unsubscribe();
        this.messageSubs.forEach(s => s.unsubscribe());
        this.messageSubs = [];
        this.messageService.disconnectSSE();
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.pollSub?.unsubscribe();
    this.messageSubs.forEach(s => s.unsubscribe());
    this.messageService.disconnectSSE();
    if (this.profilePictureUrl) URL.revokeObjectURL(this.profilePictureUrl);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  private fetchUnreadCount(): void {
    // Notifications
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => { this.unreadCount = res.unreadCount; }
    });
    // Messages (Unread conversation count)
    this.messageService.getUnreadConversationCount().subscribe({
      next: (count) => { this.unreadConversationsCount = count; }
    });
  }

  private loadNotifications(): void {
    this.notificationsLoading = true;
    this.notificationService.getMyNotifications(0, 20).subscribe({
      next: (page) => {
        this.notifications = page.content;
        this.unreadCount = page.content.filter(n => !n.read).length;
        this.notificationsLoading = false;
      },
      error: () => { this.notificationsLoading = false; }
    });
  }

  private loadConversations(): void {
    this.conversationsLoading = true;
    this.messageService.getConversations(0, 10).subscribe({
      next: (page) => {
        this.conversations = page.content;
        this.conversationsLoading = false;
      },
      error: () => { this.conversationsLoading = false; }
    });
  }

  private refreshConversations(): void {
    // Always refresh the badge count
    this.messageService.getUnreadConversationCount().subscribe({
      next: (count) => { this.unreadConversationsCount = count; }
    });

    if (this.showMessages) {
      this.loadConversations();
    }
  }

  private loadProfilePicture(): void {
    this.profileService.getProfilePicture().subscribe({
      next: (blob) => {
        if (blob && blob.size > 0 && blob.type.startsWith('image/')) {
          if (this.profilePictureUrl) URL.revokeObjectURL(this.profilePictureUrl);
          this.profilePictureUrl = URL.createObjectURL(blob);
        } else {
          this.profilePictureUrl = null;
        }
      },
      error: () => { this.profilePictureUrl = null; }
    });
  }

  logout(): void {
    if (this.profilePictureUrl) URL.revokeObjectURL(this.profilePictureUrl);
    this.profilePictureUrl = null;
    this.pollSub?.unsubscribe();
    this.messageSubs.forEach(s => s.unsubscribe());
    this.messageService.disconnectSSE();
    this.authService.clearUser();
    this.router.navigate(['/']);
  }

  openAddBook(): void { this.showAddBookPopup = true; }
  closeAddBook(): void { this.showAddBookPopup = false; }

  getDisplayName(user: AuthUser): string {
    if (user.fullName?.trim()) {
      return user.fullName;
    }

    if (user.email?.includes('@')) {
      return user.email.split('@')[0];
    }

    return user.email || 'User';
  }

  getInitials(fullName: string | undefined, email: string): string {
    if (fullName?.trim()) return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return email ? email[0].toUpperCase() : '?';
  }

  getConversationInitials(conv: DtoConversationResponse): string {
    if (conv.friendName?.trim()) {
      const parts = conv.friendName.trim().split(/\s+/);
      if (parts.length === 1) return parts[0][0].toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return conv.friendEmail ? conv.friendEmail[0].toUpperCase() : '?';
  }

  private ensureUserFullName(user: AuthUser): void {
    if (user.fullName?.trim()) {
      return;
    }

    this.profileService.getProfile().subscribe({
      next: (profile) => {
        const fullName = profile.fullName?.trim() || `${profile.firstname ?? ''} ${profile.lastname ?? ''}`.trim();
        if (!fullName) {
          return;
        }

        this.authService.setUser({
          ...user,
          fullName
        });
      }
    });
  }
}
