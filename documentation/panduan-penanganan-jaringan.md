# PANDUAN PENANGANAN JARINGAN NEMESYS
## Network Troubleshooting & Incident Management Guide

---

## DAFTAR ISI

1. [Prosedur Umum Penanganan Gangguan](#1-prosedur-umum-penanganan-gangguan)
2. [Klasifikasi Tingkat Keparahan](#2-klasifikasi-tingkat-keparahan)
3. [Troubleshooting Perangkat UniFi](#3-troubleshooting-perangkat-unifi)
4. [Troubleshooting Perangkat Router](#4-troubleshooting-perangkat-router)
5. [Troubleshooting Switch](#5-troubleshooting-switch)
6. [Troubleshooting Access Point](#6-troubleshooting-access-point)
7. [Monitoring Suhu Ruang Server](#7-monitoring-suhu-ruang-server)
8. [Penanganan Perangkat Solar](#8-penanganan-perangkat-solar)
9. [Analisis Topologi Jaringan](#9-analisis-topologi-jaringan)
10. [Penggunaan Bot Telegram](#10-penggunaan-bot-telegram)
11. [Eskalasi Masalah](#11-eskalasi-masalah)
12. [Checklist Harian Teknisi](#12-checklist-harian-teknisi)

---

## 1. PROSEDUR UMUM PENANGANAN GANGGUAN

### 1.1 Alur Kerja Standar

```
[Alert Diterima] → [Analisis] → [Diagnosis] → [Tindakan] → [Verifikasi] → [Dokumentasi]
```

### 1.2 Langkah-langkah Detail

#### STEP 1: Menerima Alert
- ✅ Buka notifikasi dari Bot Telegram
- ✅ Tekan tombol **[Terima Tugas]**
- ✅ Catat informasi: Nama perangkat, IP Address, Lokasi, Waktu kejadian


#### STEP 2: Analisis Awal (Remote Check)
- ✅ Buka Dashboard Web NEMESYS
- ✅ Cek status perangkat di **NetMap Global** atau **NetList**
- ✅ Lihat detail alert di menu **Daily Task**
- ✅ Periksa **Topology** untuk melihat dampak ke perangkat downstream
- ✅ Cek history uptime/downtime perangkat

#### STEP 3: Diagnosis Remote
Lakukan langkah berikut dari komputer/laptop:

```bash
# Test konektivitas dasar
ping <IP_ADDRESS> -n 10

# Trace route untuk melihat jalur
tracert <IP_ADDRESS>

# Cek port terbuka (jika ada akses telnet/SSH)
telnet <IP_ADDRESS> 22
```

**Hasil yang mungkin:**
- **Request Timeout** → Perangkat benar-benar mati atau kabel putus
- **Destination Host Unreachable** → Masalah routing atau gateway
- **Reply from ...** → Perangkat hidup, kemungkinan masalah konfigurasi/SNMP


#### STEP 4: Tindakan Perbaikan
Pilih tindakan sesuai hasil diagnosis:

| Kondisi | Tindakan |
|---------|----------|
| Ping timeout total | Kunjungi lokasi fisik, cek power & kabel |
| Ping reply tapi SNMP timeout | Restart SNMP service atau reboot perangkat |
| Intermittent ping loss | Cek kualitas kabel/koneksi, ganti jika perlu |
| Device unreachable | Cek gateway/router upstream |

#### STEP 5: Verifikasi
- ✅ Pastikan ping stabil (0% packet loss)
- ✅ Cek Dashboard NEMESYS, marker di peta berubah hijau
- ✅ Verifikasi SNMP query berhasil (muncul data model/firmware)
- ✅ Test koneksi user (jika Access Point)

#### STEP 6: Dokumentasi & Penutupan
- ✅ Update status di Dashboard Web
- ✅ Tekan tombol **[Selesai]** di Bot Telegram
- ✅ Tulis catatan singkat di kolom "Notes":
  - Penyebab masalah
  - Tindakan yang dilakukan
  - Komponen yang diganti (jika ada)

---


## 2. KLASIFIKASI TINGKAT KEPARAHAN

### 2.1 Severity Level

| Level | Nama | Deskripsi | SLA | Contoh |
|-------|------|-----------|-----|--------|
| **P1** | **Critical** | Core network down, berdampak ke seluruh kampus | **30 menit** | Router backbone mati, Data Center offline |
| **P2** | **High** | Gedung/area besar terdampak | **2 jam** | Switch gedung utama down, Internet gedung mati |
| **P3** | **Medium** | Satu ruangan/lantai terdampak | **4 jam** | Access Point ruang kelas mati |
| **P4** | **Low** | Perangkat backup/monitoring | **8 jam** | Sensor suhu error, perangkat solar low battery |

### 2.2 Penanganan Berdasarkan Severity

#### Priority 1 (Critical) - IMMEDIATE RESPONSE
```
[Alert] → [Call Coordinator] → [Team Mobilization] → [On-site ASAP]
```
- 🚨 **Eskalasi otomatis** ke Coordinator dan Manager
- 📞 **Koordinasi tim**: minimal 2 teknisi standby
- ⏱️ **Target**: Tim on-site dalam 15 menit
- 📱 **Update**: Setiap 15 menit via Telegram grup


#### Priority 2 (High) - URGENT
```
[Alert] → [Assess Impact] → [Schedule On-site] → [Fix within 2 hours]
```
- ⚠️ **Notifikasi**: Coordinator dan teknisi available
- 📊 **Analisis**: Cek jumlah user terdampak
- 🔧 **Persiapan**: Bawa spare switch/AP jika tersedia

#### Priority 3 (Medium) - NORMAL
```
[Alert] → [Remote Diagnosis] → [Plan Visit] → [Fix within 4 hours]
```
- 📋 **Queue**: Masuk antrian Daily Task
- 🛠️ **Optimasi**: Gabungkan dengan kunjungan area sekitar

#### Priority 4 (Low) - SCHEDULED
```
[Alert] → [Log Ticket] → [Scheduled Maintenance]
```
- 📅 **Penjadwalan**: Maintenance window (di luar jam sibuk)
- 📦 **Persiapan**: Order spare parts jika diperlukan

---


## 3. TROUBLESHOOTING PERANGKAT UNIFI

### 3.1 Informasi Monitoring UniFi (dari unifi.yml)

Perangkat UniFi di-monitor melalui SNMP dengan parameter:

| Parameter | SNMP OID | Update Interval | Keterangan |
|-----------|----------|-----------------|------------|
| **Modelo** | .1.3.6.1.4.1.41112.1.6.3.3.0 | 1 hari | Model perangkat (UAP-AC-PRO, dll) |
| **Versão Firmware** | .1.3.6.1.4.1.41112.1.6.3.6.0 | 1 hari | Versi firmware terpasang |
| **Padrão Wi-Fi (Radio 1)** | .1.3.6.1.4.1.41112.1.6.1.1.1.3.1 | 1 hari | Standard 2.4GHz (802.11n/ac) |
| **Padrão Wi-Fi (Radio 2)** | .1.3.6.1.4.1.41112.1.6.1.1.1.3.2 | 1 hari | Standard 5GHz (802.11ac/ax) |
| **SSID 2.4GHz** | .1.3.6.1.4.1.41112.1.6.1.2.1.6.1 | 12 jam | Nama jaringan 2.4GHz |
| **SSID 5GHz** | .1.3.6.1.4.1.41112.1.6.1.2.1.6.3 | 12 jam | Nama jaringan 5GHz |
| **Usuários Conectados** | .1.3.6.1.4.1.41112.1.6.1.2.1.8.1 | 2 menit | Jumlah client terhubung |

### 3.2 Masalah Umum UniFi

#### 🔴 Masalah: UniFi Access Point Offline

**Gejala:**
- Marker merah di NetMap
- Ping timeout ke IP perangkat
- SNMP query gagal
- User tidak dapat connect WiFi


**Diagnosis:**

```bash
# 1. Test ping
ping <IP_UNIFI> -n 20

# 2. Cek dari switch upstream
# Login ke switch, lihat port status

show interfaces status | include <PORT_NUMBER>

# 3. Cek SNMP (dari server monitoring)
snmpwalk -v2c -c <COMMUNITY> <IP_UNIFI> .1.3.6.1.4.1.41112
```

**Solusi Bertahap:**

**STEP 1: Remote Reboot (jika ping reply)**
```bash
# Via SSH (jika masih accessible)
ssh ubnt@<IP_UNIFI>
# Password default: ubnt (jika belum diganti)

# Reboot command
reboot

# Atau via UniFi Controller
# Network > Devices > [Pilih Device] > Actions > Restart
```


**STEP 2: Cek Power (On-site)**
- ✅ Cek LED power pada perangkat (seharusnya **putih/biru** menyala)
- ✅ Jika LED mati total:
  - Cek kabel PoE dari switch
  - Test dengan PoE injector portable (jika ada)
  - Ganti kabel ethernet jika rusak
- ✅ Jika LED **oranye berkedip**: proses booting, tunggu 2-3 menit

**STEP 3: Factory Reset (last resort)**
```
1. Cabut power dari perangkat
2. Tekan dan tahan tombol RESET
3. Sambil tetap menekan, colokkan power kembali
4. Tahan 10 detik hingga LED berkedip oranye-putih bergantian
5. Lepas tombol, tunggu proses reset (5 menit)
6. Adopt ulang ke UniFi Controller
```

⚠️ **PERHATIAN:** Factory reset akan menghapus konfigurasi. Pastikan backup config tersedia!


**STEP 4: Pengecekan SNMP**

Jika perangkat hidup tapi data monitoring tidak muncul:

```bash
# 1. Test SNMP manual
snmpget -v2c -c <COMMUNITY_STRING> <IP_UNIFI> .1.3.6.1.4.1.41112.1.6.3.3.0

# Expected output: STRING: "UAP-AC-PRO" (atau model lain)
```

Jika gagal, cek konfigurasi SNMP di perangkat:
```bash
ssh ubnt@<IP_UNIFI>

# Cek SNMP config
cat /etc/snmp/snmpd.conf

# Cek SNMP service running
ps | grep snmp

# Restart SNMP jika perlu
/etc/init.d/snmpd restart
```

#### 🟡 Masalah: User Tidak Bisa Connect tapi AP Online

**Gejala:**
- Ping ke AP berhasil
- LED normal (putih/biru)
- SSID terlihat tapi tidak bisa connect
- User count = 0 di monitoring


**Diagnosis:**

```bash
# Cek via UniFi Controller
# Dashboard > Insights > WiFi Experience

# Cek error rate, interference, channel utilization
```

**Solusi:**

1. **Restart Radio WiFi**
   ```
   UniFi Controller > Devices > [Pilih AP] > Config > Radios
   - Disable 2.4GHz & 5GHz
   - Apply
   - Tunggu 30 detik
   - Enable kembali
   ```

2. **Ganti Channel WiFi** (jika interference tinggi)
   ```
   UniFi Controller > Settings > WiFi
   - Channel 2.4GHz: Auto atau 1, 6, 11
   - Channel 5GHz: Auto atau 36, 40, 44, 149
   ```

3. **Cek VLAN & DHCP**
   - Pastikan VLAN sesuai konfigurasi
   - Test DHCP dari laptop: `ipconfig /renew`


#### 🔵 Masalah: Firmware Outdated

**Gejala:**
- Versi firmware lama terdeteksi di monitoring
- Notifikasi update available di Controller

**Prosedur Update Firmware:**

⚠️ **HANYA LAKUKAN SAAT JAM SEPI (22:00 - 06:00)** ⚠️

```
1. Backup konfigurasi di UniFi Controller
2. Download firmware terbaru dari ui.com
3. UniFi Controller > Devices > [Pilih AP]
4. Actions > Custom Upgrade > Upload firmware
5. Monitor progress (biasanya 5-10 menit)
6. Verifikasi post-upgrade:
   - Cek firmware version di monitoring
   - Test koneksi user
   - Cek SNMP query
```

**Rollback jika gagal:**
```
UniFi Controller > Devices > [Pilih AP] > Actions > Custom Upgrade
Upload firmware versi sebelumnya
```

---


## 4. TROUBLESHOOTING PERANGKAT ROUTER

### 4.1 Identifikasi Masalah Router

#### 🔴 Router Backbone Down (P1 - Critical)

**Impact:** Seluruh gedung/area kehilangan internet

**Immediate Actions:**

```bash
# 1. Physical check (on-site ASAP)
- Cek LED Power, WAN, LAN
- Cek kabel fiber/ethernet
- Cek suhu perangkat (overheat?)

# 2. Console access (jika ada kabel console)
minicom /dev/ttyUSB0 -b 9600
# Atau via Putty (Windows): COM port, Baud 9600

# Lihat system log
show logging
```

**Troubleshooting Steps:**

1. **Cold Reboot**
   ```bash
   # Via console atau SSH
   reload
   
   # Confirm: yes
   # Tunggu 3-5 menit proses booting
   ```


2. **Cek Interface Status**
   ```bash
   # Cisco
   show ip interface brief
   show interfaces status
   
   # Mikrotik
   /interface print
   /ip address print
   
   # Cari interface yang status "down"
   ```

3. **Cek Routing Table**
   ```bash
   # Cisco
   show ip route
   
   # Mikrotik
   /ip route print
   
   # Pastikan default route ada:
   # 0.0.0.0/0 via <GATEWAY_IP>
   ```

4. **Test Upstream Connectivity**
   ```bash
   # Ping ke gateway ISP
   ping <ISP_GATEWAY>
   
   # Ping ke DNS public
   ping 8.8.8.8
   ping 1.1.1.1
   
   # Traceroute
   traceroute 8.8.8.8
   ```


#### 🟡 High CPU/Memory Usage

**Gejala:**
- Koneksi lambat/intermittent
- Router masih ping tapi packet loss tinggi
- Web management tidak responsive

**Diagnosis:**

```bash
# Cisco
show processes cpu sorted
show memory statistics

# Mikrotik
/system resource print
/system resource cpu print

# Check threshold:
# CPU > 80% sustained = problem
# Memory > 90% = problem
```

**Solusi:**

1. **Identifikasi Process Penyebab**
   ```bash
   # Mikrotik example
   /tool profile
   # Tunggu 30 detik, lihat process usage
   ```

2. **Clear Connection Tracking** (untuk NAT overload)
   ```bash
   # Cisco
   clear ip nat translation *
   
   # Mikrotik
   /ip firewall connection print count-only
   /ip firewall connection remove [find]
   ```


3. **Reboot Scheduler** (preventive)
   ```bash
   # Mikrotik - reboot otomatis jam 4 pagi
   /system scheduler add name=auto-reboot \
     start-time=04:00:00 interval=1d \
     on-event="/system reboot"
   ```

### 4.2 Backup Konfigurasi Router

**WAJIB dilakukan sebelum perubahan besar!**

```bash
# Cisco
copy running-config tftp://192.168.1.100/backup-router-<HOSTNAME>-<DATE>.cfg

# Mikrotik
/export file=backup-<HOSTNAME>-<DATE>
# Download via FTP/SFTP

# Simpan di folder: /documentation/backups/routers/
```

---


## 5. TROUBLESHOOTING SWITCH

### 5.1 Switch Gedung Down (P2 - High)

**Impact:** Satu gedung/lantai offline

**Quick Check:**

```bash
# 1. Ping test
ping <SWITCH_IP> -n 20

# 2. Cek dari router/core switch
show cdp neighbors
show mac address-table | include <SWITCH_PORT>

# 3. Physical check on-site
- LED power
- LED uplink port
- Kabel fiber/ethernet
- Temperatur switch (sentuh casing)
```

**Troubleshooting:**

1. **Uplink Problem**
   ```bash
   # Cek port uplink (biasanya Gigabit atau SFP)
   show interface GigabitEthernet 0/1
   
   # Lihat:
   # - Line protocol: up/down?
   # - Errors, collisions?
   # - Input/output rate
   
   # Jika down, cek:
   # - Kabel putus
   # - SFP module rusak
   # - Port di upstream switch down
   ```


2. **Loop Detection**
   ```bash
   # Gejala: LED port berkedip cepat abnormal
   
   # Cisco - cek spanning tree
   show spanning-tree
   show spanning-tree blockedports
   
   # Jika ada loop:
   # - Cabut kabel yang membuat loop
   # - Enable BPDU guard:
     spanning-tree portfast bpduguard default
   ```

3. **Port Flapping**
   ```bash
   # Cek error counter
   show interfaces counters errors
   
   # Jika tinggi:
   # - Ganti kabel
   # - Clear counter dan monitor ulang:
     clear counters GigabitEthernet 0/1
   ```

### 5.2 Broadcast Storm

**Gejala:**
- Network sangat lambat
- CPU switch tinggi
- Packet loss tinggi

**Solusi:**

```bash
# 1. Cek traffic rate
show interfaces | include rate

# 2. Shutdown port tersangka broadcast
interface GigabitEthernet 0/5
shutdown

# 3. Monitor apakah membaik
# Jika ya, troubleshoot perangkat di port tersebut
```

---


## 6. TROUBLESHOOTING ACCESS POINT

### 6.1 AP Tidak Memberikan IP (DHCP Issue)

**Gejala:**
- WiFi connect tapi "No Internet"
- Device mendapat IP 169.254.x.x (APIPA)
- User stuck di "Obtaining IP address"

**Diagnosis:**

```bash
# 1. Test DHCP dari laptop (Windows)
ipconfig /release
ipconfig /renew

# Lihat output:
# Sukses: mendapat IP valid (192.168.x.x)
# Gagal: timeout atau APIPA (169.254.x.x)

# 2. Cek DHCP server
# Login ke DHCP server/router
show ip dhcp binding
show ip dhcp pool

# 3. Cek lease habis
# Jika pool penuh, perbesar range:
ip dhcp pool WIFI
  network 192.168.10.0 255.255.255.0
  default-router 192.168.10.1
  dns-server 8.8.8.8
```


### 6.2 WiFi Interference (Koneksi Lambat)

**Gejala:**
- WiFi connect tapi sangat lambat
- Sering disconnect-reconnect
- Speedtest jauh di bawah normal

**Diagnosis:**

1. **WiFi Analyzer** (gunakan app mobile)
   - Download: "WiFi Analyzer" (Android) atau "NetSpot" (iOS)
   - Scan channel 2.4GHz dan 5GHz
   - Lihat: Channel overlap, signal strength

2. **Optimal Channel Selection**

   **2.4GHz (hanya gunakan channel 1, 6, atau 11):**
   ```
   Channel 1  : 2412 MHz
   Channel 6  : 2437 MHz (paling sedikit overlap)
   Channel 11 : 2462 MHz
   ```

   **5GHz (lebih banyak pilihan, lebih stabil):**
   ```
   Band UNII-1: 36, 40, 44, 48   (indoor)
   Band UNII-2: 52-64             (DFS, hindari jika banyak radar)
   Band UNII-3: 149-165           (outdoor, high power)
   ```


3. **Ganti Channel via Controller**
   ```
   UniFi Controller > Settings > WiFi > [Pilih Network]
   - 2.4GHz: Manual select channel 1, 6, atau 11
   - 5GHz: Auto atau manual 36, 40, 149
   - Channel Width 2.4GHz: 20MHz (jangan 40MHz, terlalu overlap)
   - Channel Width 5GHz: 40MHz atau 80MHz
   ```

### 6.3 Roaming Issues

**Gejala:**
- User berpindah ruangan, WiFi tidak auto-switch AP
- Stuck di AP jauh dengan signal lemah

**Solusi: Optimize Roaming**

```
UniFi Controller > Settings > WiFi > [Pilih Network]

Roaming Settings:
✅ Enable Fast Roaming (802.11r)
✅ Enable BSS Transition (802.11v)
✅ Minimum RSSI: -70 dBm (kick user dengan signal lemah)
✅ AP Isolation: OFF (kecuali untuk guest network)
```

---


## 7. MONITORING SUHU RUANG SERVER

### 7.1 Threshold Suhu

| Suhu | Status | Warna | Tindakan |
|------|--------|-------|----------|
| < 18°C | **Terlalu Dingin** | 🔵 Biru | Kurangi AC |
| 18-24°C | **Optimal** | 🟢 Hijau | Normal |
| 25-28°C | **Warning** | 🟡 Kuning | Monitor ketat |
| 29-32°C | **Alert** | 🟠 Oranye | Immediate action |
| > 32°C | **Critical** | 🔴 Merah | Emergency! |

### 7.2 Prosedur Handling Overheating

#### Temperature > 28°C (Warning)

```
IMMEDIATE ACTIONS:
1. ✅ Cek AC ruang server berfungsi normal
2. ✅ Cek filter AC (tersumbat debu?)
3. ✅ Cek pintu ruang server tertutup rapat
4. ✅ Cek airflow: tidak ada kardus/barang menghalangi ventilasi
5. ✅ Cek beban server: ada yang overload CPU?
```


#### Temperature > 32°C (Critical)

```
🚨 EMERGENCY PROCEDURE:

1. Eskalasi ke Manager SEGERA
2. Call teknisi AC untuk immediate repair
3. Siapkan portable AC jika tersedia
4. Monitor suhu setiap 5 menit
5. Jika suhu naik > 35°C:
   
   PERTIMBANGKAN SHUTDOWN GRACEFUL:
   - Backup data kritis
   - Matikan server non-esensial
   - Maintain hanya core services
   
⚠️ JANGAN mematikan server tiba-tiba tanpa koordinasi Manager!
```

### 7.3 Preventive Maintenance

**Weekly Checklist:**
- ✅ Cek filter AC (bersihkan jika kotor)
- ✅ Cek trend suhu 7 hari terakhir di Dashboard
- ✅ Pastikan tidak ada barang menghalangi ventilasi

**Monthly Checklist:**
- ✅ Service AC rutin (call vendor AC)
- ✅ Bersihkan debu di rack server dengan blower
- ✅ Cek fan server berfungsi normal

---


## 8. PENANGANAN PERANGKAT SOLAR

### 8.1 Monitoring Parameter Solar

| Parameter | Threshold | Status | Tindakan |
|-----------|-----------|--------|----------|
| **Battery > 70%** | Optimal | 🟢 Normal | No action |
| **Battery 30-70%** | Caution | 🟡 Monitor | Cek cuaca, solar panel |
| **Battery 15-30%** | Warning | 🟠 Alert | Schedule maintenance |
| **Battery < 15%** | Critical | 🔴 Urgent | On-site ASAP |

### 8.2 Troubleshooting Solar Powered Device

#### 🔴 Battery Low (< 30%)

**Penyebab Umum:**
1. **Solar panel kotor/tertutup** (daun, debu)
2. **Cuaca mendung berkepanjangan**
3. **Battery degradation** (umur > 2 tahun)
4. **Konsumsi power berlebih** (terlalu banyak client)


**On-site Actions:**

```
STEP 1: Inspect Solar Panel
✅ Bersihkan panel dengan lap lembut + air
✅ Cek tidak ada retak/pecah
✅ Pastikan orientasi panel optimal (menghadap selatan)
✅ Tidak ada bayangan pohon/gedung

STEP 2: Check Battery Connections
✅ Cek terminal battery kencang (tidak kendor)
✅ Cek tidak ada korosi di terminal
✅ Measure voltage dengan multimeter:
   - 12V battery: seharusnya 12.6-13.2V (full charge)
   - 24V battery: seharusnya 25.2-26.4V (full charge)

STEP 3: Charge Controller Check
✅ Cek LED indicator (hijau = charging, merah = error)
✅ Cek connection solar panel → controller → battery
✅ Lihat display controller: charging current (A)
```

**Temporary Solution (jika mendung terus):**
- Matikan feature non-esensial (guest WiFi, logging verbose)
- Kurangi transmit power AP (80% → 50%)
- Koordinasi dengan Manager untuk battery swap sementara


#### 🟡 Charging Not Detected

**Gejala:**
- Panel status: "Discharging" terus menerus
- Battery capacity turun perlahan
- Voltage controller input = 0V

**Diagnosis:**

```bash
# Ukur voltage dengan multimeter

1. Solar Panel Output (siang hari, cerah):
   Seharusnya: 18-22V (untuk sistem 12V)
   Jika 0V: panel rusak atau kabel putus

2. Controller Input:
   Seharusnya: sama dengan panel output
   Jika berbeda: kabel putus antara panel-controller

3. Controller Output (ke battery):
   Seharusnya: 13-14V (saat charging)
   Jika 0V: controller rusak
```

**Penggantian Komponen:**
- 🔧 Kabel solar: gunakan kabel outdoor UV resistant 2.5mm²
- 🔧 Charge controller: bawa spare MPPT 10A-20A
- 🔋 Battery: bawa spare battery 12V 100Ah (untuk lokasi kritis)

---


## 9. ANALISIS TOPOLOGI JARINGAN

### 9.1 Menggunakan Menu Topology di Dashboard

**Cara Membaca Diagram:**

```
[Router Backbone] (hijau)
    │
    ├─── [Switch Gedung A] (hijau)
    │       ├─── [AP Lantai 1] (hijau) ✅
    │       ├─── [AP Lantai 2] (merah) ❌
    │       └─── [AP Lantai 3] (abu-abu) ⚪ isolated
    │
    └─── [Switch Gedung B] (merah) ❌
            ├─── [AP Ruang 101] (abu-abu) ⚪ isolated
            └─── [AP Ruang 102] (abu-abu) ⚪ isolated
```

**Legend:**
- 🟢 **Hijau**: Device Up (normal)
- 🔴 **Merah**: Device Down (masalah di device itu sendiri)
- ⚪ **Abu-abu**: Device Isolated (parent device down, anak otomatis unreachable)


### 9.2 Strategi Penanganan Berdasarkan Topology

#### Scenario 1: Multiple Device Down Downstream

```
Jika melihat:
[Switch Gedung B] (merah) 
  └─── [10 AP] (semua abu-abu)

JANGAN troubleshoot 10 AP satu per satu!

✅ CORRECT: Fix Switch Gedung B dulu
❌ WRONG: Pergi ke 10 AP satu-satu
```

**Prioritas Troubleshooting:**
1. **Router/Core Switch** (paling critical, dampak paling luas)
2. **Distribution Switch** (per gedung/area)
3. **Access Switch** (per lantai)
4. **End Device** (AP, IP Phone, dll)

#### Scenario 2: Partial Downstream Down

```
[Switch OK] (hijau)
  ├─── [AP 1] (hijau) ✅
  ├─── [AP 2] (merah) ❌
  └─── [AP 3] (hijau) ✅

Kesimpulan: Masalah di AP 2 sendiri, BUKAN di Switch
```

---


## 10. PENGGUNAAN BOT TELEGRAM

### 10.1 Registrasi Teknisi

```
Langkah Pertama Kali:
1. Buka Telegram, search: @nemesys_bot (sesuai nama bot Anda)
2. Klik Start
3. Kirim command: /start <username_anda>
   
   Contoh: /start teknisi01
   
4. Bot akan reply:
   ✅ "Registrasi berhasil! Halo [Nama Teknisi]"
   atau
   ❌ "Username tidak ditemukan. Hubungi Administrator"
```

### 10.2 Menerima Notifikasi Alert

**Format Notifikasi:**

```
🚨 ALERT - GANGGUAN JARINGAN

Device: AP-Gedung-A-Lt2
IP: 192.168.10.50
Lokasi: Gedung A, Lantai 2, Ruang 201
Jenis: Device Down
Waktu: 2024-01-15 10:30:45
Severity: P3 - Medium

─────────────────
[ Terima Tugas ]  [ Abaikan ]
```


**Actions:**

1. **Tekan [Terima Tugas]**
   - Status Anda di Dashboard berubah: Available → Busy
   - Tugas masuk ke Daily Task Anda
   - Anda dapat: "Tugas diterima. Segera ditangani."

2. **Tekan [Abaikan]** (hanya jika sedang handle P1/P2 lain)
   - Tugas akan di-offer ke teknisi lain yang Available

### 10.3 Melaporkan Penyelesaian

**Setelah tugas selesai:**

```
Bot: Apakah tugas [AP-Gedung-A-Lt2] sudah selesai?

[ Ya, Selesai ]  [ Belum Selesai ]
```

**Tekan [Ya, Selesai]:**
- Mission Completed Anda +1
- Status Anda: Busy → Available (jika tidak ada tugas lain)
- Bot confirm: "✅ Tugas selesai dalam 45 menit. Good job!"

**Tekan [Belum Selesai]:**
- Bot: "Perlu bantuan tambahan? /help untuk opsi"


### 10.4 Command Reference

| Command | Fungsi | Contoh |
|---------|--------|--------|
| `/start <username>` | Registrasi akun | `/start teknisi01` |
| `/status` | Cek status tugas Anda | `/status` |
| `/mytasks` | List tugas aktif | `/mytasks` |
| `/stats` | Lihat statistik Mission Anda | `/stats` |
| `/help` | Bantuan command | `/help` |

---

## 11. ESKALASI MASALAH

### 11.1 Kriteria Eskalasi

**Eskalasi ke Coordinator:**
- ✅ Masalah P1/P2 yang belum resolved dalam 1 jam
- ✅ Membutuhkan spare part yang tidak tersedia
- ✅ Masalah berulang pada perangkat yang sama (> 3x dalam seminggu)
- ✅ Butuh akses/izin khusus (vendor support, password root)

**Eskalasi ke Manager:**
- ✅ Masalah P1 yang berdampak luas (> 500 user)
- ✅ Keputusan bisnis diperlukan (shutdown scheduled, budget)
- ✅ Koordinasi dengan pihak eksternal (ISP, vendor)


### 11.2 Format Laporan Eskalasi

**Via Telegram ke Coordinator/Manager:**

```
🔴 ESKALASI - P1 CRITICAL

Device: Router-Backbone-GedungUtama
Issue: Total outage, tidak bisa remote access
Impact: 1500 users gedung A, B, C offline
Duration: 45 menit (sejak 14:00)

Troubleshooting done:
✅ Physical check: Power LED off
✅ Coba ganti power cable: tidak berhasil
✅ Test power outlet: outlet OK (240V)

Assessment:
❌ Power supply router mati
❌ Tidak ada spare PSU on-site

Request:
🚨 Need immediate spare PSU atau replace router
🚨 Need decision: continue downtime atau failover ke backup?

ETA to site: 10 menit
Reported by: Teknisi Ahmad
Time: 14:45
```

---


## 12. CHECKLIST HARIAN TEKNISI

### 12.1 Morning Routine (08:00 - 09:00)

```
☐ Login Dashboard NEMESYS
☐ Cek Daily Task yang assigned ke saya
☐ Cek NetMap Global: ada marker merah?
☐ Cek Telegram: ada alert tadi malam?
☐ Cek Mission stats: target hari ini
☐ Cek inventory tools:
  ☐ Laptop + charger
  ☐ Kabel console
  ☐ Crimping tool + RJ45
  ☐ Multimeter
  ☐ Tester kabel
  ☐ Label stiker
  ☐ Flashlight
  ☐ Spare kabel ethernet (5m, 10m)
```

### 12.2 Evening Routine (16:00 - 17:00)

```
☐ Update semua Daily Task yang sudah selesai
☐ Tekan [Selesai] di Bot Telegram untuk semua tugas
☐ Tulis notes lengkap di Dashboard (penyebab + solusi)
☐ Upload foto jika ada penggantian komponen
☐ Cek Mission Completed hari ini: target tercapai?
☐ Report masalah yang memerlukan follow-up besok
☐ Set status: Available → Offline (jika shift selesai)
```


### 12.3 Weekly Maintenance (Setiap Jumat)

```
☐ Cek statistik 7 hari terakhir di Dashboard
☐ List perangkat yang sering bermasalah (> 3x down)
☐ Schedule preventive maintenance untuk perangkat tersebut
☐ Cek backup konfigurasi router/switch ter-update
☐ Cek stok spare parts:
  ☐ Kabel ethernet
  ☐ RJ45 connector
  ☐ PoE injector
  ☐ SFP module
☐ Request restock jika < 20% dari minimum
☐ Bersihkan workspace/kendaraan operasional
```

---

## LAMPIRAN

### A. Kontak Penting

```
📞 Emergency Contact:

Coordinator:    +62-xxx-xxxx-xxx1
Manager:        +62-xxx-xxxx-xxx2
ISP Support:    147 (Telkom) / 188 (Indihome)
AC Technician:  +62-xxx-xxxx-xxx3
Elektrik:       +62-xxx-xxxx-xxx4

Grup Telegram Tim: @nemesys_team
```


### B. SNMP OID Reference UniFi

**Quick Reference dari unifi.yml:**

```yaml
# System Info
Modelo Device:       .1.3.6.1.4.1.41112.1.6.3.3.0
Firmware Version:    .1.3.6.1.4.1.41112.1.6.3.6.0

# WiFi Radio
Padrão WiFi Radio 1: .1.3.6.1.4.1.41112.1.6.1.1.1.3.1  (2.4GHz)
Padrão WiFi Radio 2: .1.3.6.1.4.1.41112.1.6.1.1.1.3.2  (5GHz)

# SSID
SSID 2.4GHz:         .1.3.6.1.4.1.41112.1.6.1.2.1.6.1
SSID 5GHz:           .1.3.6.1.4.1.41112.1.6.1.2.1.6.3

# Client Stats
Connected Users:     .1.3.6.1.4.1.41112.1.6.1.2.1.8.1
```

**Test SNMP Manual:**
```bash
# Cek model
snmpget -v2c -c public <IP_UNIFI> .1.3.6.1.4.1.41112.1.6.3.3.0

# Cek jumlah user
snmpget -v2c -c public <IP_UNIFI> .1.3.6.1.4.1.41112.1.6.1.2.1.8.1
```


### C. Troubleshooting Decision Tree

```
[Device Down Alert Received]
         |
         v
    [Can Ping?] ---NO---> [Physical Check On-site]
         |                      |
        YES                     v
         |              [Power LED ON?] ---NO---> [Check Power Source]
         v                      |
    [SNMP Reply?]              YES
         |                      |
        NO                      v
         |              [Link LED ON?] ---NO---> [Check Cable/Port]
         v                      |
  [Restart SNMP]              YES
         |                      |
         v                      v
  [Test Again]         [Check Configuration]
         |                      |
         v                      v
    [Working?] ---YES---> [Mark Completed]
         |
        NO
         |
         v
    [Escalate to Coordinator]
```

---


### D. Common Error Messages & Solutions

| Error Message | Penyebab | Solusi |
|---------------|----------|--------|
| `Request Timeout` | Device mati/kabel putus | Physical check on-site |
| `Destination Host Unreachable` | Routing/gateway issue | Cek router upstream |
| `SNMP Timeout` | SNMP service down/firewall | Restart SNMP / cek firewall |
| `Authentication Failure (SNMP)` | Community string salah | Verifikasi community string |
| `No DHCP offers received` | DHCP pool full/server down | Cek DHCP server, perbesar pool |
| `Connected, No Internet` | Gateway/DNS issue | Cek default route & DNS |
| `High Packet Loss (>5%)` | Cable quality/interference | Ganti kabel / adjust channel |
| `Loop Detected` | Spanning tree issue | Shutdown looped port |

---

## PENUTUP

**Dokumentasi ini adalah living document.**  
Update secara berkala berdasarkan:
- Perangkat baru yang ditambahkan
- Best practice baru yang ditemukan
- Feedback dari tim teknisi

**Last Updated:** 2024-06-22  
**Version:** 1.0  
**Maintained by:** Tim Network Operations NEMESYS

---

**💡 Tips Sukses untuk Teknisi:**

1. **Selalu dokumentasikan** - Tulis notes lengkap setiap task
2. **Preventive > Reactive** - Better prevent than fix
3. **Komunikasi proaktif** - Update status berkala via Telegram
4. **Learn from failures** - Analyze root cause, jangan cuma fix symptom
5. **Teamwork** - Jangan ragu minta bantuan kalau stuck

**Good luck & stay safe!** 🚀

