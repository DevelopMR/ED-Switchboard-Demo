export interface SwDrawerCountSlot {
  slot: number;
  countedAt?: string;
  countedBy?: string;
}

export interface SwDrawerCountState {
  boxes: SwDrawerCountSlot[];
}
