import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Network, 
  Map, 
  List, 
  Thermometer, 
  Sun, 
  BookOpen, 
  BarChart3, 
  MessageSquare,
  ShieldAlert,
  LogOut,
  Target,
  Moon
} from 'lucide-react';
import { io } from 'socket.io-client';
import type { Device, DailyTask, User, Mission, TemperatureLog, DailyTodo, CustomMission, DeviceCategory } from './types';
import { Dashboard } from './components/Dashboard';
import { DailyTaskComponent } from './components/DailyTask';
import { MissionPage } from './components/MissionPage';
import { Team } from './components/Team';
import { NetMap } from './components/NetMap';
import { NetList } from './components/NetList';
import { Topology } from './components/Topology';
import { TempSolar } from './components/TempSolar';
import { Documentation } from './components/Documentation';
import { Statistics } from './components/Statistics';
import { TelegramBot } from './components/TelegramBot';
import { Login } from './components/Login';
import { CrudManager } from './components/CrudManager';
import { EditLocation } from './components/EditLocation';

const BACKEND_URL = 'http://localhost:5000';
const socket = io(BACKEND_URL);

interface AuthUser {
  id: number;
  username: string;
  name: string;
  role: 'Administrator' | 'Manager' | 'Teknisi';
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('nemesys_token'));
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(
    JSON.parse(localStorage.getItem('nemesys_user') || 'null')
  );

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('nemesys_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('nemesys_theme', theme);
  }, [theme]);

  const [devices, setDevices] = useState<Device[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [tempLogs, setTempLogs] = useState<TemperatureLog[]>([]);
  const [dailyTodos, setDailyTodos] = useState<DailyTodo[]>([]);
  const [customMissions, setCustomMissions] = useState<CustomMission[]>([]);
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  
  const [currentMenu, setCurrentMenu] = useState<string>('dashboard');
  const [telegramOpen, setTelegramOpen] = useState<boolean>(true);
  const [currentTemp, setCurrentTemp] = useState<number>(24.5);

  const [tgMessages, setTgMessages] = useState<Array<{ id: number; text: string; taskId?: number; showButtons?: boolean }>>([
    { id: 1, text: "Selamat datang di Nemesys Telegram Notification Bot.\nKetik /start <username> untuk menghubungkan akun dashboard Anda." },
    { id: 2, text: "✓ Akun terhubung dengan Bot." }
  ]);

  // Auto-sync open tasks to simulated Telegram messages
  useEffect(() => {
    if (!token || tasks.length === 0) return;
    tasks.forEach((task) => {
      if (task.status === 'Open') {
        const hasMsg = tgMessages.some((m) => m.taskId === task.id);
        if (!hasMsg) {
          const alertText = `🚨 GANGGUAN BARU DETEKSI ZABBIX\nPerangkat: ${task.device_name}\nIP: ${task.ip_address}\nLokasi: ${task.location}\nStatus: DOWN\n\nSilakan pilih opsi tindakan:`;
          setTgMessages((prev) => {
            if (prev.some((m) => m.taskId === task.id)) return prev;
            return [
              ...prev,
              { id: Date.now() + task.id, text: alertText, taskId: task.id, showButtons: true }
            ];
          });
        }
      }
    });
  }, [tasks, tgMessages, token]);

  // Fetch all data from backend (with auth header)
  const fetchData = async () => {
    if (!token) return;

    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const devRes = await fetch(`${BACKEND_URL}/api/devices`, { headers });
      const devData = await devRes.json();
      if (!devData.error) setDevices(devData);

      const taskRes = await fetch(`${BACKEND_URL}/api/tasks`, { headers });
      const taskData = await taskRes.json();
      if (!taskData.error) setTasks(taskData);

      const userRes = await fetch(`${BACKEND_URL}/api/users`, { headers });
      const userData = await userRes.json();
      if (!userData.error) setUsers(userData);

      const missionRes = await fetch(`${BACKEND_URL}/api/missions`, { headers });
      const missionData = await missionRes.json();
      if (!missionData.error) setMissions(missionData);

      const todoRes = await fetch(`${BACKEND_URL}/api/daily-todos`, { headers });
      const todoData = await todoRes.json();
      if (!todoData.error) setDailyTodos(todoData);

      const customMissionRes = await fetch(`${BACKEND_URL}/api/custom-missions`, { headers });
      const customMissionData = await customMissionRes.json();
      if (!customMissionData.error) setCustomMissions(customMissionData);

      const catRes = await fetch(`${BACKEND_URL}/api/categories`);
      const catData = await catRes.json();
      if (!catData.error) setCategories(catData);

      const tempRes = await fetch(`${BACKEND_URL}/api/temp-logs`, { headers });
      const tempData = await tempRes.json();
      if (!tempData.error) {
        setTempLogs(tempData);
        if (tempData.length > 0) {
          setCurrentTemp(tempData[0].temperature);
        }
      }
    } catch (err) {
      console.error('Failed to fetch data from backend:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();

      // Listen to real-time broadcasts
      socket.on('data_changed', () => {
        fetchData();
      });
    }

    return () => {
      socket.off('data_changed');
    };
  }, [token]);

  // Periodic temperature logger simulation (sending to backend)
  useEffect(() => {
    if (!token) return;

    const timer = setInterval(async () => {
      const change = (Math.random() - 0.5) * 0.8;
      const nextTemp = parseFloat((currentTemp + change).toFixed(1));
      
      try {
        await fetch(`${BACKEND_URL}/api/temp/update`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ temperature: nextTemp })
        });
      } catch (err) {
        // fail silently
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [currentTemp, token]);

  const handleLoginSuccess = (newToken: string, user: AuthUser) => {
    localStorage.setItem('nemesys_token', newToken);
    localStorage.setItem('nemesys_user', JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
    setCurrentMenu('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('nemesys_token');
    localStorage.removeItem('nemesys_user');
    setToken(null);
    setCurrentUser(null);
  };

  // Trigger simulated Zabbix error (POST request to backend webhook)
  const triggerAlert = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/alerts/trigger`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        const device = devices.find(d => d.status === 'Up' && d.id !== 1);
        if (device) {
          const alertText = `🚨 GANGGUAN BARU DETEKSI ZABBIX\nPerangkat: ${device.name}\nIP: ${device.ip_address}\nLokasi: ${device.location}\nStatus: DOWN\n\nSilakan pilih opsi tindakan:`;
          setTgMessages((prev) => [
            ...prev,
            { id: Date.now(), text: alertText, taskId: data.taskId, showButtons: true }
          ]);
        }
      } else {
        alert(data.error || 'Gagal men-trigger gangguan.');
      }
    } catch (err) {
      alert('Gagal menghubungi backend API.');
    }
  };

  // Bot action: Accept Task
  const handleAcceptTask = async (taskId: number) => {
    const tech = users.find((u) => u.role === 'Teknisi' && u.status === 'Available') 
      || users.find((u) => u.role === 'Teknisi'); // fallback
    
    if (!tech) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/tasks/${taskId}/assign`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: tech.id })
      });
      if (res.ok) {
        setTgMessages((prev) => [
          ...prev,
          { id: Date.now(), text: `✓ Tugas berhasil diterima oleh ${tech.name} (Busy).` }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Bot action: Complete Task
  const handleCompleteTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/tasks/${taskId}/assign`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: task.assigned_user_id })
      });
      
      if (res.ok) {
        await fetch(`${BACKEND_URL}/api/temp/update`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ temperature: currentTemp })
        });
        
        setTgMessages((prev) => [
          ...prev,
          { id: Date.now(), text: `✓ Tugas [${task.device_name}] selesai dikerjakan.` }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Manual assign task via Admin dropdown selector
  const handleAssignTask = async (taskId: number, userId: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/tasks/${taskId}/assign`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        const user = users.find(u => u.id === userId);
        const task = tasks.find(t => t.id === taskId);
        setTgMessages((prev) => [
          ...prev,
          { 
            id: Date.now(), 
            text: `📢 Tugas [${task?.device_name}] ditugaskan manual ke ${user?.name}.`,
            taskId: taskId,
            showButtons: true
          }
        ]);
      }
    } catch (err) {
      alert('Gagal menugaskan teknisi.');
    }
  };

  const renderActiveView = () => {
    switch (currentMenu) {
      case 'dashboard':
        return <Dashboard devices={devices} tasks={tasks} onTriggerAlert={triggerAlert} onNavigate={setCurrentMenu} />;
      case 'tasks':
        return <DailyTaskComponent tasks={tasks} users={users} missions={missions} onAssignTask={handleAssignTask} dailyTodos={dailyTodos} token={token || ''} onRefresh={fetchData} devices={devices} />;
      case 'mission-view':
        return <MissionPage customMissions={customMissions} users={users} token={token || ''} onRefresh={fetchData} isAdmin={currentUser?.role === 'Administrator'} />;
      case 'team':
        return <Team users={users} token={token || ''} isAdmin={currentUser?.role === 'Administrator'} onRefresh={fetchData} />;
      case 'netmap-core':
        return <NetMap devices={devices} isCoreOnly={true} categories={categories} />;
      case 'netmap-global':
        return <NetMap devices={devices} isCoreOnly={false} categories={categories} />;
      case 'netlist':
        return <NetList devices={devices} token={token || ''} onRefresh={fetchData} isAdmin={currentUser?.role === 'Administrator'} categories={categories} />;
      case 'temp':
      case 'solar':
        return <TempSolar devices={devices} tempLogs={tempLogs} currentTemp={currentTemp} />;
      case 'topology':
        return <Topology devices={devices} token={token || ''} onRefresh={fetchData} isAdmin={currentUser?.role === 'Administrator'} />;
      case 'documentation':
        return <Documentation />;
      case 'statistics':
        return <Statistics devices={devices} tasks={tasks} categories={categories} />;
      case 'manage':
        return <CrudManager devices={devices} users={users} token={token || ''} onRefresh={fetchData} />;
      case 'edit-location':
        return <EditLocation devices={devices} token={token || ''} onRefresh={fetchData} categories={categories} />;
      default:
        return <Dashboard devices={devices} tasks={tasks} onTriggerAlert={triggerAlert} onNavigate={setCurrentMenu} />;
    }
  };

  if (!token || !currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-logo">NEMESYS</span>
          <span className="brand-version">v1.3</span>
        </div>
        <nav className="sidebar-menu">
          <span className="menu-section-title">Core Task</span>
          <a className={`menu-item ${currentMenu === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentMenu('dashboard')}>
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <a className={`menu-item ${currentMenu === 'tasks' ? 'active' : ''}`} onClick={() => setCurrentMenu('tasks')}>
            <ClipboardList size={18} /> Daily Task
          </a>
          <a className={`menu-item ${currentMenu === 'mission-view' ? 'active' : ''}`} onClick={() => setCurrentMenu('mission-view')}>
            <Target size={18} /> Mission
          </a>
          <a className={`menu-item ${currentMenu === 'team' ? 'active' : ''}`} onClick={() => setCurrentMenu('team')}>
            <Users size={18} /> Team
          </a>

          <span className="menu-section-title">Monitoring</span>
          <a className={`menu-item ${currentMenu === 'netmap-core' ? 'active' : ''}`} onClick={() => setCurrentMenu('netmap-core')}>
            <Map size={18} /> NetMap Core
          </a>
          <a className={`menu-item ${currentMenu === 'netmap-global' ? 'active' : ''}`} onClick={() => setCurrentMenu('netmap-global')}>
            <Map size={18} /> NetMap Global
          </a>
          <a className={`menu-item ${currentMenu === 'netlist' ? 'active' : ''}`} onClick={() => setCurrentMenu('netlist')}>
            <List size={18} /> NetList
          </a>
          <a className={`menu-item ${currentMenu === 'temp' ? 'active' : ''}`} onClick={() => setCurrentMenu('temp')}>
            <Thermometer size={18} /> Temp Sensor
          </a>
          <a className={`menu-item ${currentMenu === 'solar' ? 'active' : ''}`} onClick={() => setCurrentMenu('solar')}>
            <Sun size={18} /> Solar Power
          </a>
          <a className={`menu-item ${currentMenu === 'topology' ? 'active' : ''}`} onClick={() => setCurrentMenu('topology')}>
            <Network size={18} /> Topology
          </a>

          <span className="menu-section-title">Supporting</span>
          <a className={`menu-item ${currentMenu === 'documentation' ? 'active' : ''}`} onClick={() => setCurrentMenu('documentation')}>
            <BookOpen size={18} /> Documentation
          </a>
          <a className={`menu-item ${currentMenu === 'statistics' ? 'active' : ''}`} onClick={() => setCurrentMenu('statistics')}>
            <BarChart3 size={18} /> Statistic
          </a>

          {currentUser.role === 'Administrator' && (
            <>
              <span className="menu-section-title">Admin Panel</span>
              <a className={`menu-item ${currentMenu === 'manage' ? 'active' : ''}`} onClick={() => setCurrentMenu('manage')}>
                <ShieldAlert size={18} /> Manage System
              </a>
              <a className={`menu-item ${currentMenu === 'edit-location' ? 'active' : ''}`} onClick={() => setCurrentMenu('edit-location')}>
                <Map size={18} /> Edit Location
              </a>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="main-header">
          <h2 className="header-title" style={{ textTransform: 'capitalize' }}>
            {currentMenu.replace('-', ' ')}
          </h2>
          <div className="header-actions">
            {/* Connection state */}
            <div className="user-badge" style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              <span className="badge-dot active" />
              WebSocket Connected
            </div>
            
            {/* Telegram Bot Toggle */}
            <button 
              className="btn-primary" 
              onClick={() => setTelegramOpen(!telegramOpen)}
              style={{
                padding: '6px 12px',
                fontSize: '12.5px',
                background: telegramOpen ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'var(--bg-secondary)',
                border: telegramOpen ? 'none' : '1px solid var(--border-color)',
                color: telegramOpen ? '#fff' : 'var(--text-secondary)'
              }}
            >
              <MessageSquare size={14} />
              Bot Telegram: {telegramOpen ? 'Open' : 'Closed'}
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn-primary"
              style={{
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                width: '34px',
                height: '34px'
              }}
              title={theme === 'dark' ? 'Ganti ke Tampilan Light' : 'Ganti ke Tampilan Dark'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} style={{ color: '#6366f1' }} />}
            </button>

            {/* Profile */}
            <div className="user-badge" style={{ fontWeight: 600 }}>
              {currentUser.name} ({currentUser.role})
            </div>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-danger)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </header>

        <div className="content-body">
          {renderActiveView()}
        </div>

        {/* Telegram Chat Simulation */}
        <TelegramBot
          tasks={tasks}
          messages={tgMessages}
          isOpen={telegramOpen}
          setIsOpen={setTelegramOpen}
          onAcceptTask={handleAcceptTask}
          onCompleteTask={handleCompleteTask}
        />
      </main>
    </div>
  );
}
