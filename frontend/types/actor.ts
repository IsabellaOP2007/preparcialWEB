export interface Actor {
  id: string;
  name: string;
  photo: string;
  nationality: string;
  birthDate: string;
  biography: string;
}

export interface CreateActorDto {
  name: string;
  photo: string;
  nationality: string;
  birthDate: string;
  biography: string;
}
