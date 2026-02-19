import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RoomService } from './room.service';

describe('RoomService', () => {
  let service: RoomService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(RoomService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list rooms', () => {
    service.list({ page: 1, limit: 20 }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/rooms');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should get a room by id', () => {
    service.get('room-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/rooms/room-1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 'room-1' } });
  });

  it('should create a room', () => {
    service.create({ name: 'Room 101', capacity: 30, roomType: 'classroom' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/rooms');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Room 101');
    req.flush({ success: true, data: { id: 'new-id' } });
  });

  it('should update a room', () => {
    service.update('room-1', { name: 'Room 102' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/rooms/room-1');
    expect(req.request.method).toBe('PATCH');
    req.flush({ success: true, data: { id: 'room-1' } });
  });

  it('should delete a room', () => {
    service.delete('room-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/rooms/room-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
