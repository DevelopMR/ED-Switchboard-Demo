export interface LocationPresets {
  facility: string;
  department: string;
  floor: string;
  direction: string;
  room: string;
  additional: string;
}

export function composeLocation(values: LocationPresets): string {
  const pieces: string[] = [];
  add(pieces, values.facility);
  add(pieces, values.department);
  add(pieces, values.floor);
  add(pieces, values.direction);

  const room = values.room.trim();
  if (room) {
    pieces.push(/^(room|rm\.?)[\s-]/i.test(room) ? room : `Room ${room}`);
  }

  add(pieces, values.additional);
  return pieces.join(", ");
}

function add(target: string[], value: string): void {
  const cleaned = value.trim();
  if (cleaned) {
    target.push(cleaned);
  }
}
