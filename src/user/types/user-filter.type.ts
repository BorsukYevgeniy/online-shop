export interface UserFilter {
  nickname?: string;
  minDate?: Date; // YYYY-MM-DD
  maxDate?: Date; // YYYY-MM-DD
}

export interface RawUserFilter {
  nickname?: string;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
}

