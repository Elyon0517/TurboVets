import { TestBed } from '@angular/core/testing';
import { AuthStorageService } from './auth-storage.service';
import { RoleType } from '@org/data';

const mockAuth = {
  accessToken: 'test-token-123',
  user: {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    organizationId: 'org-1',
    roleId: 'role-1',
    role: RoleType.ADMIN,
    organizationName: 'Test Org',
    createdAt: new Date(),
  },
};

describe('AuthStorageService', () => {
  let service: AuthStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthStorageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null when no token stored', () => {
    expect(service.getToken()).toBeNull();
  });

  it('should return null for user when not logged in', () => {
    expect(service.getUser()).toBeNull();
  });

  it('should return false for isLoggedIn when not logged in', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should store and retrieve auth data', () => {
    service.setAuth(mockAuth);
    expect(service.getToken()).toBe('test-token-123');
    expect(service.getUser()?.email).toBe('test@example.com');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should clear auth data on logout', () => {
    service.setAuth(mockAuth);
    service.clear();
    expect(service.getToken()).toBeNull();
    expect(service.getUser()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });
});
