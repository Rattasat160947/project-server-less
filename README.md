# 🚀 ระบบเช็คชื่อนักศึกษา (Student Check-in System) — ENG23 3074

> ระบบ Web Application สำหรับเช็คชื่อเข้าเรียนในรูปแบบ Microservices (Frontend + Backend) ที่เน้นความทนทานของข้อมูลด้วย Persistent Storage บน Kubernetes และมีระบบ Automated CI/CD เต็มรูปแบบ

---


## 📌 ภาพรวมโปรเจค

### แอปพลิเคชัน
- **ชื่อโปรเจค:** ระบบเช็คชื่อนักศึกษาเข้าเรียน (Student Check-in System)
- **ประเภท:** Web Application (Frontend + Backend Microservices)
- **ภาษา / Framework:** 
  - **Frontend:** Node.js (Express), Vanilla HTML/CSS/JS, Axios
  - **Backend:** Golang (REST API), SQLite
- **คำอธิบาย:** ระบบสำหรับให้นักศึกษากรอกข้อมูลชื่อและรหัสนักศึกษาเพื่อบันทึกการเข้าเรียน โดยตัวแอปแยกส่วนการทำงานเป็น Frontend และ Backend ผ่าน Docker Container และบริหารจัดการด้วย Kubernetes Cluster เพื่อรองรับการทำงานที่เสถียร พร้อมระบบ Persistent Volume Claim (PVC) ที่ช่วยให้ข้อมูลการเช็คชื่อไม่สูญหายแม้ Pod จะเกิดการ Restart หรือความล้มเหลวในระบบ


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

### ☸️ Kubernetes Deployment (Namespace: web-app)
- **Backend:** 1 Desired Pod (SQLite Persistence)
- **Frontend:** 2 Desired Pods (High Availability)

---

## 📁 โครงสร้าง Repository (รายละเอียดไฟล์ตามจริง)

```text
project-server-less/
├── docker-compose.yml        # รัน Jenkins Container
├── .gitignore                # กรณี Ignore .env
├── README.md
├── ansible/                  # Ansible Playbooks สำหรับ Kubernetes
│   ├── deploy.yml            # Playbook หลักที่เรียนสคริปต์ย่อย
│   ├── inventory/
│   │   └── hosts.ini         # ตั้งค่าเครื่องเป้าหมาย (default: localhost สำหรับ local)
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
| Node Exporter | Latest | เก็บ CPU/Memory/Disk metrics ของ Host |
| Go | ≥ 1.25 | Compile Backend (ถ้าต้องการ build local) |
| Node.js | ≥ 18 | Run Frontend (ถ้าต้องการ run local) |

---

## 🏃 วิธีการรันโปรเจค

### Clone Repository
```bash
git clone https://github.com/Rattasat160947/project-server-less.git
cd project-server-less
```

### 1. Build และรันด้วย Docker (แบบ Local Manual)
```bash
# Backend (รันที่พอร์ต 8080)
cd backend
docker build -t server-backend .
docker run -d -p 8080:8080 --name my-backend server-backend

# Frontend (รันที่พอร์ต 80)
cd ../frontend
docker build -t server-frontend .
docker run -d -p 80:80 --name my-frontend -e BACKEND_URL="http://[IP_เครื่องคุณ]:8080" server-frontend
```

### 2. รัน CI/CD และ Deployment เครื่องมือหลัก
1. ตั้งค่า Jenkins Agent ชื่อ "wsl":
   - ไปที่ Jenkins Dashboard → Manage Nodes and Clouds → New Node
   - ตั้งชื่อ: `wsl`, เลือก Permanent Agent
   - กำหนด Labels: `wsl`
2. รัน Jenkins:
   ```bash
   docker-compose up -d
   ```
   (เข้า Jenkins ได้ที่ `http://localhost:80`)
3. สร้าง Pipelines ชี้ไปที่ `jenkins/build/*` และ `jenkins/deploy/*`
   - ตั้ง Credentials: `github-creds` (GitHub username + password/token) และ `docker-hub-creds` (Docker Hub username + password)
4. Jenkins จะดำเนินการใช้ Ansible Playbook สั่ง Deploy งานลงไปยัง Kubernetes ให้ทั้งหมด

### 3. Deploy Kubernetes ด้วย Ansible (สั่งการด้วยมือ)

**สำหรับ Local/Development (Kubernetes บนเครื่องเดียวกัน):**
```bash
cd ansible
ansible-playbook -i inventory/hosts.ini deploy.yml -e "version=latest" -e "docker_user=[ชื่อ_DOCKER_HUB]"
```

**สำหรับ Production (Kubernetes บนเครื่องอื่น):**

ต้องแก้ไข `ansible/inventory/hosts.ini` เพื่อชี้ไปยัง Kubernetes master/control node:
```ini
k8s-master ansible_host=192.168.1.100 ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
```
แล้วรัน:
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
### ลำดับการทำงานของ Pipeline

```
Checkout ──▶ Build ──▶ Test ──▶ Docker Build ──▶ Push to Hub ──▶ Deploy
```

| Stage | คำอธิบาย |
|-------|----------|
| **Checkout** | ดึงโค้ดล่าสุดจาก GitHub |
| **Build** | ติดตั้ง dependencies |
| **Test** | รัน unit test |
| **Docker Build** | สร้าง Docker image |
| **Push to Hub** | อัปโหลด image ขึ้น Docker Hub |
| **Deploy** | รัน  Ansible แล้ว apply Kubernetes manifests |

### วิธีตั้งค่า Jenkins
1. ติดตั้ง Jenkins และเปิดที่ `http://localhost:8080`
2. ติดตั้ง plugin: **Git**, **Pipeline**, **Docker Pipeline**
3. เพิ่ม credentials สำหรับ Docker Hub (ชื่อ `docker-hub-creds`)
4. สร้าง Pipeline job ใหม่ และชี้ไปที่ repository นี้
5. ตั้งค่า Webhook ใน GitHub:
   - ไปที่ **Settings → Webhooks → Add webhook**
   - Payload URL: `http://[jenkins-host]:8080/github-webhook/`
   - Content type: `application/json`
   - ติ๊ก trigger: **Just the push event**

---
## ☸️ Kubernetes Deployment

### Apply Manifests ด้วยตัวเอง
```bash
kubectl apply -f /ansible/deploy.yml
```

### ตรวจสอบสถานะ
```bash
kubectl get pods -n web-app
kubectl get svc -n web-app
```

### ผลลัพธ์ที่ควรจะได้
```
NAME                        READY   STATUS    RESTARTS   AGE
backend-xxxxxxxxx-xxxxx  1/1     Running   0          2m
frontend-xxxxxxxxx-yyyyy  1/1     Running   0          2m

NAME            TYPE       CLUSTER-IP     PORT(S)          AGE
[app-name]-svc  NodePort   10.96.xx.xxx   5000:30080/TCP   2m
```
```
NAME                      TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
backend-metrics-service   NodePort    [ IP ]     <none>        9100:30301/TCP   46h
backend-service           ClusterIP   [ IP ]   <none>        8080/TCP         4d20h
frontend-service          NodePort    [ IP ]    <none>        80:30300/TCP     4d20h
```

### เข้าถึงแอปพลิเคชัน
```
http://localhost:30300
```

---
## 📊 Monitoring (Prometheus & Grafana)

### Prometheus — เก็บ Metrics
- ไฟล์ config หลักตั้งอยู่ที่ `prometheus/prometheus.yml`
- Prometheus ติดตั้ง 4 job สำหรับเก็บเมตริก:
  1. **prometheus** - Self-monitoring ที่พอร์ต 9090
  2. **node_metrics** - Node Exporter สำหรับ Host metrics ที่พอร์ต 9100
  3. **frontend_metrics** - Frontend app metrics ที่พอร์ต 30300
- รันและตรวจสอบระบบด้วยความรวดเร็ว: 
```bash
cd prometheus
docker-compose up -d
# Prometheus ทำงานที่พอร์ต 9090
# Grafana ทำงานที่พอร์ต 3000 (default: admin/admin)
# Node Exporter ทำงานที่พอร์ต 9100
```

### การตั้งค่า Grafana
1. เข้า Grafana: `http://localhost:3000`
2. Login default: **admin** / **admin**
3. ตั้ง Data Source ไปยัง `http://prometheus:9090`
4. สร้าง Panel เพื่อเรียกดูสถานะได้ทันที:


### Alert Rules (ตั้งค่าในไฟล์ alert_rules.yml)

| Alert Name | Condition | Severity | Description |
|-----------|-----------|----------|----------
| InstanceDown | Service ล่มมานานกว่า 1 นาที | critical | ตรวจสอบ up == 0 |
| HighCheckinRate | Check-in มากกว่า 10 ครั้ง/นาที | warning | ตรวจสอบ spike ของการเช็คชื่อ |
| BackendHighMemory | Backend ใช้ RAM > 500MB นาน 2 นาที | warning | ตรวจสอบ container resource |


---
### 🧪 API Endpoints

Method | Endpoint | คำอธิบาย
--- | --- | ---
GET | / | Health check — ตรวจสอบสถานะว่าแอปพลิเคชันยังรันอยู่ตามปกติ
GET | /metrics | Prometheus Metrics — ส่งข้อมูลเมทริกซ์ (เช่น frontend_checkins_total) ให้ Prometheus Server ดึงไปประมวลผล
GET | /api/checkins | Get All Check-ins — ดึงข้อมูลรายชื่อนักศึกษาและรหัสนักศึกษาทั้งหมดที่บันทึกอยู่ในฐานข้อมูล SQLite
POST | /api/checkin | Submit Check-in — รับข้อมูลชื่อ-รหัสนักศึกษาจากหน้า Frontend เพื่อบันทึกลงในไฟล์ app.db
---

## 🐛 ปัญหาที่พบบ่อย (Troubleshooting)

### 🔧 1. ปัญหาด้าน Infrastructure & Network

**Permission Denied: Docker Socket**
```bash
sudo chmod 666 /var/run/docker.sock
```
> Jenkins ไม่สามารถสั่งงาน Docker build ได้เนื่องจาก Docker socket มีสิทธิ์จำกัด

**Port Conflict (Address already in use): 8081/8080**
```bash
sudo lsof -i :8081
sudo kill -9 <PID>
```
> พอร์ตถูกยึดครองโดยโปรเซสค้างเก่า (docker-proxy) ต้องคืนพอร์ตให้ระบบ

**ngrok Version Outdated: v2 → v3**
```bash
# ตรวจสอบเวอร์ชัน:
ngrok version

# อัปเกรดและตั้งค่า Token:
ngrok config add-authtoken <YOUR_TOKEN>

# รัน ngrok:
ngrok http 8080
```
> ngrok v2 ไม่รองรับการยืนยันตัวตนด้วย Token ต้องอัปเกรดเป็น v3

---

### 🚀 2. ปัญหาด้าน CI/CD & Deployment

**ImagePullBackOff: Image version mismatched**
```bash
# ตรวจสอบ Event:
kubectl describe pod [pod-name] -n web-app

# แก้ไข Ansible Playbook:
ansible-playbook -i inventory/hosts.ini deploy.yml \
  -e "version=${BUILD_NUMBER}" \
  -e "docker_user=[DOCKER_HUB_USERNAME]"
```
> Docker Hub มี image เป็น `username/app:1.0.0` แต่ Kubernetes ค้นหา `:latest`

**Missing GitHub Plugin: No "GitHub hook trigger" option**
```bash
# ติดตั้งผ่าน Jenkins UI:
# 1. Manage Jenkins > Manage Plugins
# 2. ค้นหา "GitHub Plugin"
# 3. Install and Restart Jenkins
```
> GitHub Webhook ต้องใช้ GitHub Plugin เพื่อประมวลผลและทริกเกอร์ Job

**500 Internal Server Error: Frontend ↔ Backend Connection Failed**
```bash
# สร้าง Docker Network:
docker network create serverless-net

# รัน Backend ด้วยพอร์ตใหม่:
docker run -d --network serverless-net -p 8081:8080 \
  docker--name backend server-backend : version

# รัน Frontend ด้วย BACKEND_URL:
docker run -d --network serverless-net -p 80:80 \
  -e BACKEND_URL="http://backend:8080" \
  docker--name frontend server-frontend : version
```
> Frontend ไม่สามารถเชื่อมต่อ Backend เนื่องจาก Network isolation หรือ BACKEND_URL ไม่ถูกต้อง

---

### 💾 3. ปัญหาด้าน Persistence & Monitoring

**Data Loss on Pod Restart: SQLite data disappears**
```bash
# ตรวจสอบ PVC Status (ต้อง Bound):
kubectl get pvc -n web-app

# ตรวจสอบไฟล์ database:
kubectl exec -it [backend-pod] -n web-app -- ls -la /app/data

# ตรวจสอบขนาดไฟล์ (ต้อง > 0):
kubectl exec -it [backend-pod] -n web-app -- stat /app/data/app.db
```
> ข้อมูล SQLite หายเมื่อ Pod Restart เนื่องจาก PVC Mount ไม่ถูกต้อง

**Metrics Inconsistency: Grafana values fluctuate (Multiple Replicas)**
```promql
# ❌ ผิด (แสดง Pod เดียว):
frontend_checkins_total

# ✅ ถูก (รวมทั้งหมด):
sum(frontend_checkins_total)

# หรือ specify job:
sum by (job) (frontend_checkins_total)
```
> มี Frontend 2 Pods ต้องใช้ `sum()` รวมข้อมูลจากทุก Instances

**No Data in Grafana: Graph ไม่แสดงข้อมูล**
```bash
# ตรวจสอบ Targets ใน Prometheus:
# 1. เข้า Prometheus UI: http://localhost:9090
# 2. ไปที่ Status > Targets
# 3. ตรวจสอบ Instance ลงทะเบียนถูกต้องหรือไม่

# ตรวจสอบ Scrape Configs:
curl http://localhost:9090/api/v1/targets
```
> Grafana ไม่แสดงข้อมูลเนื่องจาก Instance ค้างใน Prometheus หรือ Filter ผิด


---

## 📄 ข้อมูลการส่งงาน

- วิชา: **ENG23 3074 — Serverless and Cloud Architectures**
- อาจารย์ผู้สอน: **ดร. นันทวุฒิ  คะอังกุ**
- ภาควิชาวิศวกรรมคอมพิวเตอร์


## 📚 เอกสารอ้างอิง

- [Jenkinsfile Declarative Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Terraform Documentation](https://developer.hashicorp.com/terraform/docs)
- [Ansible Documentation](https://docs.ansible.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Markdown Syntax](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)

