export interface User {
  id: number;
  username: string;
  name: string;
  role: 'Administrator' | 'Manager' | 'Teknisi';
  telegram_chat_id: string | null;
  status: 'Available' | 'Busy';
  daily_tasks_count: number;
  mission_completed: number;
  mission_incompleted: number;
}

export interface DeviceCategory {
  id: number;
  name: string;
  svg_icon: string | null;
}

export interface Device {
  id: number;
  name: string;
  type: string;
  ip_address: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'Up' | 'Down' | 'Warning' | 'Maintenance';
  last_ping: string;
  is_backbone: boolean;
  battery_percentage?: number; // for solar devices
  voltage?: number; // for solar devices
  solar_status?: 'Charging' | 'Discharging' | 'Full';
  description?: string;
  category?: string;
  web_config_url?: string;
  device_image?: string;
  parent_id?: number | null;
}

export interface DailyTask {
  id: number;
  device_id: number;
  device_name: string;
  ip_address: string;
  location: string;
  assigned_user_id: number | null;
  assigned_user_name: string | null;
  status: 'Open' | 'In Progress' | 'Completed';
  severity: 'Warning' | 'Alert' | 'Emergency';
  started_at: string;
  completed_at: string | null;
  sla_minutes: number;
  resolution_notes?: string | null;
  steps?: string | null;
}

export interface Mission {
  id: number;
  task_id: number;
  user_id: number;
  user_name: string;
  task_device_name: string;
  status: 'Completed' | 'Incompleted';
  completed_at: string;
  resolution_notes?: string | null;
}

export interface TemperatureLog {
  id: number;
  temperature: number;
  recorded_at: string;
}

export interface DailyTodo {
  id: number;
  task_name: string;
  is_completed: boolean;
}

export interface CustomMission {
  id: number;
  title: string;
  description: string | null;
  slots: number;
  progress_percent: number;
  created_at: string;
  status: string;
  personnels: Array<{ id: number; name: string; username: string; role: string }>;
  created_by?: string | null;
  date_finished?: string | null;
  duration_str?: string | null;
  note?: string | null;
  mission_image?: string | null;
}
