export type RoomType = 'classroom' | 'lab' | 'hall' | 'library' | 'gym' | 'office';

export interface Room {
  id: string;
  schoolId: string;
  name: string;
  building: string | null;
  floor: string | null;
  capacity: number;
  roomType: RoomType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomRequest {
  name: string;
  building?: string;
  floor?: string;
  capacity: number;
  roomType: RoomType;
}

export interface UpdateRoomRequest {
  name?: string;
  building?: string | null;
  floor?: string | null;
  capacity?: number;
  roomType?: RoomType;
}

export interface ListRoomsQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'capacity';
  order?: 'asc' | 'desc';
  roomType?: RoomType;
  building?: string;
}
