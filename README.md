# 🚀 Web App Microservices (Frontend + Go Backend) — ENG23 3074

> ระบบ Web Application ที่แยกส่วน Frontend (HTML/JS) และ Backend (Golang) แบบ Microservices มีการทำ Automated CI/CD ด้วย Jenkins, Deploy ด้วย Ansible ลง Kubernetes และ Monitoring ตรวจสอบสถานะการทำงานด้วย Prometheus ร่วมกับ Grafana

---

## 👥 สมาชิกในกลุ่ม

| รหัสนักศึกษา | ชื่อ-นามสกุล | ความรับผิดชอบ |
|-------------|-------------|---------------|
| B6631345 | นางสาวชุติกาญจน์ ชมกลาง | App Development, Git |
| B6640583 | นายรัฐศาสตร์ ทองเสงี่ยม | Jenkins, Docker, Kubernetes, Ansible |
| B6641085 | นางสาวชลธิชา สุขชาลี | Monitoring |

---

## 📌 ภาพรวมโปรเจค

### แอปพลิเคชัน
- **ชื่อ:** Web App Microservices
- **ประเภท:** Web Application (Frontend + Backend Microservices)
- **ภาษา / Framework:** 
  - **Frontend:** Node.js (Express), Vanilla HTML/CSS/JS, Axios
  - **Backend:** Golang (REST API), SQLite
- **คำอธิบาย:** Web Application ที่แบ่งสถาปัตยกรรมเป็น 2 ส่วน คือ Frontend และ Backend ผ่าน Docker Container และจัดการ Orchestration ด้วย Kubernetes เพื่อให้ทนทานต่อความล้มเหลว โดยมีการเก็บข้อมูลแบบ Persistent ด้วย SQLite ผ่าน K8s PVC

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
                       Kubernetes Cluster  (Namespace: web-app)
            ┌───────────────────────────────────────────┐
            │        Frontend Pods (Node.js Port 80)    │
            │        Backend Pods (Go App Port 8080)    │
            │        SQLite PVC (Persistent Storage)    │
            │                                           │
            │  Service: frontend-service (NodePort 30300)│
            └───────────────────────────────────────────┘
                                │
                  ┌─────────────┴──────────────┐
                  ▼                            ▼
             Prometheus  ──────────────▶  Grafana
           (scrape /metrics)            (dashboard)
```

---

## 📁 โครงสร้าง Repository (รายละเอียดไฟล์ตามจริง)

```text
project-server-less/
├── docker-compose.yml        # รัน Jenkins Container
├── README.md
├── ansible/                  # Ansible Playbooks สำหรับ Kubernetes
│   ├── deploy.yml            # Playbook หลักที่เรียนสคริปต์ย่อย
│   ├── inventory/
│   │   └── hosts.ini         # ตั้งค่าเครื่องเป้าหมายที่ลง K8s
│   └── k8s-manifests/        # Task YAML ของ Ansible แทน K8s Manifest
│       ├── deploy_backend.yml
│       ├── deploy_frontend.yml
│       └── sqlite-pvc.yml
├── backend/                  # โฟลเดอร์ของ Backend
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   └── main.go               # Go REST API
├── frontend/                 # โฟลเดอร์ของ Frontend
│   ├── Dockerfile
│   └── app.js                # Web Server (Express + Axios)
├── jenkins/                  # CI/CD Pipelines ที่แบ่งเป็น Build / Deploy
│   ├── build/
│   │   ├── Jenkinsfile_backend
│   │   └── Jenkinsfile_frontend
│   └── deploy/
│       ├── Jenkinsfile_backend
│       └── Jenkinsfile_frontend
└── prometheus/               # โฟลเดอร์ของระบบ Monitoring
    ├── alert_rules.yml
    ├── docker-compose.yml    # รัน Prometheus และ Grafana
    └── prometheus.yml        # ตั้งค่า Target
```

---

## ⚙️ สิ่งที่ต้องติดตั้งก่อน (Prerequisites)

| Tool | Version | หน้าที่ |
|------|---------|---------|
| Git | ≥ 2.x | จัดการ source code |
| Docker & Compose | ≥ 24.x | สร้างและรัน container / Jenkins / Prometheus |
| Jenkins | Latest LTS | ทำ CI/CD (รันจาก docker-compose.yml นอกสุด) |
| Ansible | ≥ 2.15 | ใช้ Apply Playbook K8s |
| kubectl | ≥ 1.28 | ควบคุม Kubernetes cluster |
| Kubernetes | K3s/Minikube | Cluster ปลายทาง |
| Prometheus | ≥ 2.x | เก็บ metrics ของระบบ |
| Grafana | ≥ 10.x | แสดง dashboard แบบ Real-time |

---

## 🏃 วิธีการรันโปรเจค

### 1. Build และรันด้วย Docker (แบบ Local Manual)
```bash
# Backend (รันที่พอร์ต 8080)
cd backend
docker build -t server-backend .
docker run -d -p 8080:8080 --name my-backend server-backend

# Frontend (รันที่พอร์ต 80 แต่อาจแมปไป 3000 บน Local)
cd ../frontend
docker build -t server-frontend .
docker run -d -p 3000:80 --name my-frontend -e BACKEND_URL="http://[IP_เครื่องคุณ]:8080" server-frontend
```

### 2. รัน CI/CD และ Deployment เครื่องมือหลัก
1. รัน Jenkins:
   ```bash
   docker-compose up -d
   ```
   (เข้า Jenkins ได้ที่ `http://localhost:80`)
2. สร้าง Pipelines ชี้ไปที่ `jenkins/build/*` และ `jenkins/deploy/*`
3. Jenkins จะดำเนินการใช้ Ansible Playbook สั่ง Deploy งานลงไปยัง Kubernetes ให้ทั้งหมด

### 3. Deploy Kubernetes ด้วย Ansible (สั่งการด้วยมือ)
หากไม่ต้องการผ่าน Jenkins สามารถสั่งรัน Ansible เองได้:
```bash
cd ansible
ansible-playbook -i inventory/hosts.ini deploy.yml -e "version=latest" -e "docker_user=[ชื่อ_DOCKER_HUB]"
```
> สามารถเข้าหน้าเว็บผ่าน Node Port `30300` ของ Frontend
> `http://[IP_KUBERNETES_NODE]:30300`

---

## 🔄 CI/CD Pipeline (Jenkins)

โปรเจคนี้จัดโครงสร้าง Jenkins Pipeline ออกเป็น 2 ประเภทหลัก:
1. **วงจร Build (`jenkins/build/`)**: ตรวจโค้ด, Build Docker Image และ Push ไปที่ Docker Hub
2. **วงจร Deploy (`jenkins/deploy/`)**: เรียกใช้ข้อมูลรหัสผ่าน คลังภาพ แล้วใช้ Ansible ยิงของขึ้น Kubernetes

> **เทคนิคด้านความปลอดภัย**: ใช้งาน `withCredentials('github-creds', 'docker-hub-creds')` ซ่อนค่าลับทั้งหมดจาก Logs 

---

## 📊 Monitoring (Prometheus & Grafana)

### Prometheus — เก็บ Metrics
- ไฟล์ config หลักตั้งอยู่ที่ `prometheus/prometheus.yml`
- รันและตรวจสอบระบบด้วยความรวดเร็ว: 
```bash
cd prometheus
docker-compose up -d
# Prometheus ทำงานที่พอร์ต 9090
```

### การตั้งค่า Grafana
ตั้ง Data Source ไปยัง `http://[IP-Prometheus]:9090` ละตั้ง Panel เพื่อเรียกดูสถานะได้ทันที:

| Panel | Metric (PromQL) | แสดงข้อมูลอะไร |
|-------|-----------------|----------------|
| HTTP Request Rate | `rate(http_requests_total[1m])` | จำนวน request ต่อวินาที |
| Database Health | `up{job="backend"}` | สถานะระบบ Backend (1=ทำงาน, 0=ล่ม) |

---

## 🐛 ปัญหาที่พบบ่อย (Troubleshooting)

**Pods ใน K8s (web-app namespace) ไม่ทำงาน**
```bash
kubectl get pods -n web-app
kubectl describe pod [pod-name] -n web-app
```
(ส่วนใหญ่กิดจาก PVC ยังไม่พร้อม หรือตั้งค่า Docker Image ทะลุไม่ได้ใน Ansible/Jenkins)


---

## 📄 ข้อมูลการส่งงาน

- วิชา: **ENG23 3074 — Serverless and Cloud Architectures**
- อาจารย์ผู้สอน: **ดร. นันทวุฒิ  คะอังกุ**
- ภาควิชาวิศวกรรมคอมพิวเตอร์
