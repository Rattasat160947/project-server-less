const express = require('express');
const axios = require('axios');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 80;
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend-service:8080';

// Setup Prometheus metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

app.use(express.json());

// Metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

// Proxy route using Axios to connect Frontend Server -> Backend Go Server
app.post('/api/checkin', async (req, res) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/checkin`, req.body);
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('Error forwarding to backend:', error.message);
        res.status(error.response ? error.response.status : 500).send('Error connecting to backend');
    }
});

// Serve the single page
app.get('(.*)', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cozy Student Checker</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-[#FAF9F6] text-[#4A3F35] min-h-screen flex items-center justify-center p-6">
    <div class="fixed inset-0 overflow-hidden -z-10">
        <div class="absolute top-1/4 -left-20 w-96 h-96 bg-[#F3E5AB]/20 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#D2B48C]/15 rounded-full blur-[100px]"></div>
    </div>
    <div id="app-container" class="w-full max-w-[400px]"></div>

    <script>
        const container = document.getElementById('app-container');

        function renderForm() {
            container.innerHTML = \`
                <div class="bg-white/90 backdrop-blur-md rounded-[40px] shadow-xl p-8 border border-white">
                    <div class="text-center mb-10">
                        <div class="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-[#8B735B] text-white mb-6">
                            <i data-lucide="heart" class="fill-current"></i>
                        </div>
                        <h1 class="text-2xl font-semibold">เช็คชื่อเข้าเรียน</h1>
                    </div>
                    <form id="checkin-form" class="space-y-6">
                        <div>
                            <label class="text-xs font-medium text-[#8B7E74]">รหัสนักศึกษา</label>
                            <input type="text" id="studentId" required class="w-full p-4 bg-[#FDFCFB] border border-[#F2EFED] rounded-2xl outline-none focus:border-[#8B735B]/30" placeholder="650123456">
                        </div>
                        <div>
                            <label class="text-xs font-medium text-[#8B7E74]">ชื่อ-นามสกุล</label>
                            <input type="text" id="fullName" required class="w-full p-4 bg-[#FDFCFB] border border-[#F2EFED] rounded-2xl outline-none focus:border-[#8B735B]/30" placeholder="ชื่อ-นามสกุล">
                        </div>
                        <button type="submit" class="w-full py-4 bg-[#8B735B] text-white rounded-2xl font-medium shadow-lg hover:bg-[#78614B] transition-all">บันทึกการเช็คชื่อ</button>
                    </form>
                </div>
            \`;
            lucide.createIcons();
            
            document.getElementById('checkin-form').onsubmit = async (e) => {
                e.preventDefault();
                const data = {
                    id: document.getElementById('studentId').value,
                    name: document.getElementById('fullName').value
                };
                
                try {
                    const response = await fetch('/api/checkin', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    
                    if (response.ok) {
                        console.log('บันทึกข้อมูล:', data);
                        renderSuccess(data);
                    } else {
                        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
                }
            };
        }

        function renderSuccess(data) {
            container.innerHTML = \`
                <div class="bg-white/90 backdrop-blur-md rounded-[40px] shadow-xl p-8 border border-white text-center">
                    <div class="text-green-500 mb-6 flex justify-center"><i data-lucide="check-circle-2" class="w-16 h-16"></i></div>
                    <h2 class="text-2xl font-semibold">เช็คชื่อสำเร็จ!</h2>
                    <div class="mt-6 p-4 bg-[#FAF9F6] rounded-2xl text-left border border-[#F2EFED]">
                        <p class="text-[10px] font-bold text-[#C2B8B0] uppercase">ข้อมูลที่บันทึก</p>
                        <p class="font-medium">\${data.name}</p>
                        <p class="text-sm text-[#8B7E74]">\${data.id}</p>
                    </div>
                    <button onclick="renderForm()" class="mt-8 text-[#8B735B] text-sm font-medium hover:underline">เช็คชื่ออีกครั้ง</button>
                </div>
            \`;
            lucide.createIcons();
        }

        renderForm();
    </script>
</body>
</html>
    `);
});

app.listen(port, () => {
    console.log(`Frontend server is running on port ${port}`);
});
