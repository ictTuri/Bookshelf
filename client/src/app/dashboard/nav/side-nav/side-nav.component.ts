import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { AuthStateService, AuthUser } from '../../../service/auth/auth-state.service';
import { ThemeService, Theme } from '../../../service/theme/theme.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
  standalone: false
})
export class SideNavComponent implements OnInit, OnDestroy {
  collapsed = false;
  isBrowser: boolean;
  isAdmin = false;
  user$: Observable<AuthUser | null>;
  currentTheme$: Observable<Theme>;
  private userSub?: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthStateService,
    private themeService: ThemeService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.user$ = this.authService.user$;
    this.currentTheme$ = this.themeService.theme$;
  }

  ngOnInit(): void {
    this.userSub = this.user$.subscribe(user => {
      this.isAdmin = this.authService.isAdmin();
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
