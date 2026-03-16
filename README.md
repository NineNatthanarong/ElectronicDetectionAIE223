# 🎯 โปรเจคตรวจจับวัตถุด้วย YOLO - วิชา AIE223

เว็บแอปตรวจจับวัตถุด้วย YOLO26

## 🚀 วิธีรัน

```bash
docker-compose up --build -d
```

## 🌐 เข้าใช้งาน

- **หน้าเว็บ**: http://localhost
- **API**: http://localhost:5001

## 📋 คำสั่ง

| คำสั่ง | ความหมาย |
|--------|----------|
| `docker-compose up --build -d` | รันระบบ |
| `docker-compose down` | หยุดระบบ |
| `docker-compose logs -f` | ดู log |

## � โครงสร้าง

```
├── backend/      # Flask + YOLO
├── frontend/     # React + Vite
└── docker-compose.yml
```

---

**วิชา AIE223** 🎓
