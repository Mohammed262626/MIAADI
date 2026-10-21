export type Slot = { id: string; available_date: string; start_time: string; end_time: string; is_booked?: boolean };
export type Doctor = { id: string; name: string; specialization: string; consultation_fee: number; available_schedules: Slot[] };
