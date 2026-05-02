# 🚀 Web App Microservices (Frontend + Go Backend) — ENG23 3074

> ระบบ Web Application ที่แยกส่วน Frontend (HTML/JS) และ Backend (Golang) แบบ Microservices มีการทำ Automated CI/CD ด้วย Jenkins, Deploy ด้วย Ansible ลง Kubernetes และ Monitoring ด้วย Prometheus

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
- **Frontend:** Vanilla HTML, CSS, JS
- **Backend:** Golang (REST API) + SQLite (Persistent Storage)
- **คำอธิบาย:** Web Application ที่แบ่งสถาปัตยกรรมเป็น 2 ส่วน (Frontend และ Backend) ทำงานแยกจากกันผ่าน Docker Container และจัดการ Orchestration ด้วย Kubernetes เพื่อให้สามารถทนทานต่อความล้มเหลวและขยายระบบได้ง่าย

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
            │        Frontend Pods (Nginx)         │
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

## 📁 โครงสร้าง Repository

```text
project-server-less/
├── ansible/                  # สคริปต์สำหรับการทำ Automation Deployment ด้วย Ansible
│   ├── backend/
│   └── frontend/
├── backend/                  # โฟลเดอร์สำหรับ Backend (พัฒนาด้วย Go)
│   ├── Dockerfile            # คำสั่งสร้าง Go Backend image
│   ├── go.mod
│   └── main.go               # โค้ดหลักของ Backend
├── frontend/                 # โฟลเดอร์สำหรับ Frontend (HTML, JS)
│   ├── Dockerfile            # คำสั่งสร้าง Frontend image
│   ├── app.js
│   └── index.html            # หน้าเว็บหลัก
├── jenkins/                  # CI/CD Pipelines
│   ├── build/                # ไฟล์ Pipeline สำหรับ Build Image
│   └── deploy/               # ไฟล์ Pipeline สำหรับ Deploy
├── k8s/                      # Kubernetes Manifests
│   ├── frontend.yaml         # Deployment & Service ของ Frontend
│   ├── backend.yaml          # Deployment & Service ของ Backend
│   └── pvc.yaml              # Persistent Volume Claim สำหรับฐานข้อมูล
├── prometheus/               # การจัดการ Monitoring
│   ├── alert_rules.yml       # กฎการแจ้งเตือน
│   ├── docker-compose.yml
│   └── prometheus.yml        # ตั้งค่า Scrape metrics
└── README.md
```

---

## ⚙️ สิ่งที่ต้องติดตั้งก่อน (Prerequisites)

| Tool | Version | หน้าที่ |
|------|---------|---------|
| Git | ≥ 2.x | จัดการ Source code |
| Docker | ≥ 24.x | สร้างและรัน Container |
| Jenkins | ≥ 2.4xx | ระบบ CI/CD Automation |
| Ansible | ≥ 2.15 | Configure environment และรัน K8s Manifests |
| kubectl | ≥ 1.28 | สั่งงาน Kubernetes cluster |
| Prometheus | ≥ 2.x | เก็บ Metrics ของระบบ |

---

## 🔄 CI/CD Pipeline (Jenkins)

โปรเจคนี้จัดโครงสร้าง Jenkins Pipeline ออกเป็น **Build** และ **Deploy** แยกกันระหว่าง Frontend และ Backend:

1. **Build Pipeline** (`jenkins/build/Jenkinsfile_*`)
   - ดึงโค้ดล่าสุดจาก GitHub
   - สร้าง Docker Image (`my-app/vanilla-frontend` และ `my-app/go-backend`)
   - Push Image ขึ้น Docker Hub

2. **Deploy Pipeline** (`jenkins/deploy/Jenkinsfile_*`)
   - รัน Ansible Playbook เพื่อสั่งงานไปที่ Host ปลายทาง
   - ทำการ Apply Kubernetes Manifests (`kubectl apply -f k8s/...`) อัตโนมัติ

---

## 🏗️ Infrastructure as Code (Ansible & Kubernetes)

### 1. Kubernetes
- **Frontend:** ใช้ Kubernetes Service แบบ `NodePort` (`30080`) เพื่อรองรับ HTTP Traffic จากภายนอก
- **Backend:** รัน Pod สำหรับ Golang API และผูก `PersistentVolumeClaim (PVC)` เข้ากับ SQLite Database เพื่อเก็บข้อมูลถาวรแม้ Pod จะรีสตาร์ท

### 2. Ansible Deploy
เราใช้ Ansible ในการควบคุม Node เป้าหมายเพื่อเตรียมสภาพแวดล้อม และ Apply K8s:
```bash
cd ansible/frontend
ansible-playbook -i hosts.ini deploy_frontend.yml

cd ../backend
ansible-playbook -i hosts.ini deploy_backend.yml
```
> **หมายเหตุ:** ขั้นตอนนี้ถูกจัดการโดย Jenkins แบบอัตโนมัติ

---

## 📊 Monitoring (Prometheus)

ตั้งค่าการดึง Metrics เพื่อ Monitoring ระบบ:
- ไฟล์ config: `prometheus/prometheus.yml`
- รันด้วย Docker Compose: `docker-compose -f prometheus/docker-compose.yml up -d`
- เพิ่ม Alert Rules สำหรับการแจ้งเตือนเมื่อระบบมีปัญหา (`prometheus/alert_rules.yml`)

---

## 📄 ข้อมูลการส่งงาน

- วิชา: **ENG23 3074 — Serverless and Cloud Architectures**
- อาจารย์ผู้สอน: **ดร. นันทวุฒิ คะอังกุ**
- ภาควิชาวิศวกรรมคอมพิวเตอร์
