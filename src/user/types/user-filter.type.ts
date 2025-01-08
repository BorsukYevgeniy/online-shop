export class UserFilter {
  nickname?: string;
  minDate?: Date; // YYYY-MM-DD
  maxDate?: Date; // YYYY-MM-DD
}

export class RawUserFilter {
  nickname?: string;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
}

