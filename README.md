# 🚀 Web App Microservices (Frontend + Go Backend) — ENG23 3074

> ระบบ Web Application ที่แยกส่วน Frontend (HTML/JS) และ Backend (Golang) แบบ Microservices มีการทำ Automated CI/CD ด้วย Jenkins, Deploy ด้วย Ansible ลง Kubernetes และ Monitoring ตรวจสอบสถานะการทำงานด้วย Prometheus ร่วมกับ Grafana

---

## 👥 สมาชิกในกลุ่ม

| รหัสนักศึกษา | ชื่อ-นามสกุล | ความรับผิดชอบ |
|-------------|-------------|---------------|
| B6631345 | นางสาวชุติกาญจน์ ชมกลาง | App Development |
| B6640583 | นายรัฐศาสตร์ ทองเสงี่ยม | Git, Jenkins, Docker, Kubernetes, Ansible |
| B6641085 | นางสาวชลธิชา สุขชาลี | Monitoring |

---

## 📌 ภาพรวมโปรเจค

### แอปพลิเคชัน
- **Frontend:** Node.js (Express) สำหรับทำ Web Server เสิร์ฟ Vanilla HTML, CSS, JS และทำหน้าที่เป็น API Proxy (Axios) ชี้ไปยัง Backend
- **Backend:** Golang (REST API) + SQLite (Persistent Storage)
- **คำอธิบาย:** Web Application ที่แบ่งสถาปัตยกรรมเป็น 2 ส่วน คือ Frontend และ Backend ผ่าน Docker Container และจัดการ Orchestration ด้วย Kubernetes เพื่อให้สามารถทนทานต่อความล้มเหลวและขยายระบบได้ง่าย

### Architecture Diagram
```text
Developer
    │
    ▼  git push
 GitHub ──── webhook ────▶ Jenkins CI/CD
                                │
                    ┌───────────┼───────────┐
                    ▼                       ▼
               Build Frontend         Build Backend
               & Push Docker          & Push Docker
                    │                       │
                    └───────────┬───────────┘
                                ▼
                             Ansible
                                │
                                ▼
                       Kubernetes Cluster
            ┌──────────────────────────────────────┐
            │        Frontend Pods (Nginx/Node)    │
            │        Backend Pods (Go App)         │
            │     SQLite PVC (Persistent Vol)      │
            └──────────────────────────────────────┘
                                │
                  ┌─────────────┴──────────────┐
                  ▼                            ▼
             Prometheus  ──────────────▶  Grafana
           (scrape /metrics)            (dashboard)
```

---

## 📁 โครงสร้าง Repository (รายละเอียดไฟล์)

```text
project-server-less/
├── .gitignore
├── README.md
├── ansible/                  # สคริปต์สำหรับการทำ Automation Deployment ด้วย Ansible
│   ├── backend/
│   │   ├── deploy_backend.yml
│   │   └── hosts.ini
│   └── frontend/
│       ├── deploy_frontend.yml
│       └── hosts.ini
├── backend/                  # โฟลเดอร์สำหรับ Backend (พัฒนาด้วย Go)
│   ├── Dockerfile            # คำสั่งสร้าง Go Backend image
│   ├── go.mod
│   ├── go.sum
│   └── main.go               # โค้ดหลักของ Backend
├── frontend/                 # โฟลเดอร์สำหรับ Frontend (Node.js + HTML/JS)
│   ├── Dockerfile            # คำสั่งสร้าง Frontend image
│   └── app.js                # โค้ดหลัก Web Server (Express) ที่รวม HTML และ API Proxy ด้วย Axios แจจบในไฟล์เดียว
├── jenkins/                  # CI/CD Pipelines
│   ├── build/                # ไฟล์ Pipeline สำหรับ Build Image
│   │   ├── Jenkinsfile_backend
│   │   └── Jenkinsfile_frontend
│   └── deploy/               # ไฟล์ Pipeline สำหรับ Deploy
│       ├── Jenkinsfile_backend
│       └── Jenkinsfile_frontend
├── k8s/                      # Kubernetes Manifests
│   ├── backend.yaml          # Deployment & Service ของ Backend
│   ├── frontend.yaml         # Deployment & Service ของ Frontend
│   └── pvc.yaml              # Persistent Volume Claim สร้าง Storage ให้ SQLite
└── prometheus/               # การจัดการ Monitoring
    ├── alert_rules.yml       # กฎการแจ้งเตือน (Alert Manager)
    ├── docker-compose.yml    # รัน Prometheus Service 
    └── prometheus.yml        # ตั้งค่า Scrape metrics ไปยัง Service ต่างๆ
```

---

## ⚙️ สิ่งที่ต้องติดตั้งก่อน (Prerequisites)

ตรวจสอบให้แน่ใจว่าติดตั้งทุก tool ครบก่อนรันโปรเจค

| Tool | Version | หน้าที่ |
|------|---------|---------|
| Git | ≥ 2.x | จัดการ source code |
| Docker | ≥ 24.x | สร้างและรัน container |
| Jenkins | ≥ 2.4xx | ระบบ CI/CD automation |
| Ansible | ≥ 2.15 | Configure environment และเซ็ตอัป K8s |
| kubectl | ≥ 1.28 | สั่งงาน Kubernetes cluster |
| Prometheus | ≥ 2.x | เก็บ metrics ของระบบ |
| Grafana | ≥ 10.x | แสดง dashboard แบบ Real-time |

---

## 🏃 วิธีรันโปรเจคเบื้องต้น (Manual Quick Start)

### 1. Clone Repository
```bash
git clone https://github.com/Rattasat160947/project-server-less.git
cd project-server-less
```

### 2. รันระบบทั้งหมดด้วย Kubernetes
```bash
# ต้องสร้างไฟล์ Volume (PVC) สำหรับ Backend ก่อน
kubectl apply -f k8s/pvc.yaml
# สั่ง Deploy ระบบ
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

# คอยเช็คสถานะ
kubectl get pods,svc
```
> สามารถเข้าหน้าเว็บผ่าน IP เครื่อง Node Port `30080` สำหรับ Frontend

---

## 🔄 CI/CD Pipeline (Jenkins)

โปรเจคนี้จัดโครงสร้าง Jenkins Pipeline ออกเป็น **Build** และ **Deploy** แยกกันระหว่าง Frontend และ Backend:

### วิธีทำงานของ Pipeline:
1. **วงจร Build** (`jenkins/build/Jenkinsfile_*`)
   - ดึงโค้ดล่าสุดจาก GitHub
   - ตรวจสอบผ่านการ Test คอนเทนเนอร์หลังจาก Build
   - อัปโหลด Docker Image (`USERNAME/server-frontend` และ `USERNAME/server-backend`) ไปที่ Docker Hub และเคลียร์พื้นที่

2. **วงจร Deploy** (`jenkins/deploy/Jenkinsfile_*`)
   - ดึง Security Credentials ผ่าน Jenkins `withCredentials` (`github-creds`, `docker-hub-creds`) จากระบบ Jenkins เพื่อความปลอดภัยขั้นสูงสุดโดยไม่ให้รหัสโผล่ใน Log
   - รันคำสั่ง Ansible เพื่อย้ายไป Deploy ไฟล์ Manifest (.yaml) ภายใน Kubernetes ของระบบปลายทาง

---

## 📊 Monitoring (Prometheus & Grafana)

แยกการจัดการส่วนมอนิเตอร์ริ่งออกมาที่โฟลเดอร์ `prometheus/` 

### Prometheus — เก็บ Metrics
- ไฟล์ config: `prometheus/prometheus.yml`
- Scrape endpoint เป้าหมายเช่น Backend metrics
- รันและเปิดระบบผ่าน Docker Compose: 
```bash
docker-compose -f prometheus/docker-compose.yml up -d
# เปิด UI ตรวจสอบได้ที่ http://localhost:9090
```

### Grafana — แสดง Dashboard
ระบบต่อเชื่อม Prometheus เข้ากับ Grafana เพื่อสร้าง Dashboard ใช้ดูสุขภาพของแอปพลิเคชัน:
1. เปิด Grafana ที่ `http://localhost:3000`
2. ตั้งค่า Data Source ระบุเป็น `http://[IP-Prometheus]:9090`
3. ไปที่ **Dashboards → Import** 

### Panels ที่ควรตั้งค่าใน Dashboard (PromQL)

| Panel | Metric (PromQL) | แสดงข้อมูลอะไร |
|-------|-----------------|----------------|
| HTTP Request Rate | `rate(http_requests_total[1m])` | จำนวน request ต่อวินาที |
| Error 5xx Rate | `rate(http_requests_total{status=~"5.."}[1m])` | จำนวณ Error Server ต่อวินาที |
| CPU Usage | `rate(process_cpu_seconds_total[1m])` | ปริมาณ CPU ที่แอปใช้งาน |
| Pod Database Health | `up{job="backend"}` | สถานะระบบ Backend (1=ทำงาน, 0=ล่ม) |

---

## 🐛 ปัญหาที่พบบ่อย (Troubleshooting)

**Pods ค้างอยู่ที่ `Pending` ไม่ยอม Running**
```bash
kubectl describe pod [pod-name]
# ดูที่ Events: อาจเกิดจาก Node ทรัพยากรไม่พอ หรือ PVC ผิดพลาด
```

**Jenkins สั่ง Build/Deploy ไม่สำเร็จ (Authentication Failed)**
- ให้ตรวจสอบว่าคุณได้สร้าง Credentials ใน Jenkins อย่างถูกต้องหรือไม่ โดยระบบต้องการ 2 Credentials: 
  1. `github-creds` (สำหรับ Git Clone โค้ด) 
  2. `docker-hub-creds` (สำหรับ Login และ Push รูปภาพขึ้น Docker Hub)
- ไม่จำเป็นต้องใช้ไฟล์ `.env` สำหรับ Pipeline อีกต่อไปแล้ว ระบบถูกปรับให้ใช้ตัวแปรจาก Jenkins อย่างปลอดภัย

**Prometheus แสดง target เป็น DOWN หรือ Unhealthy**
```bash
# ตรวจระดับ Pods ของ Backend ให้แน่ใจว่ารันอยู่ และเผยแพร่ /metrics
curl http://localhost:30500/metrics
# ตรวจสอบไฟล์ prometheus.yml ว่าเป้าหมาย target ตรงกับพอร์ตที่ Kubernetes แจกจ่ายหรือไม่
```

---

## 📄 ข้อมูลการส่งงาน

- วิชา: **ENG23 3074 — Serverless and Cloud Architectures**
- อาจารย์ผู้สอน: **ดร. นันทวุฒิ  คะอังกุ**
- ภาควิชาวิศวกรรมคอมพิวเตอร์
