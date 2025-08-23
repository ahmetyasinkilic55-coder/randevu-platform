## WebRTC P2P Video Call Mimarisi

### 1. SIGNALING SERVER GEREKLİ
```
Kişi A ←→ Signaling Server ←→ Kişi B
```

### 2. SDP EXCHANGE SÜRECİ
```
A: createOffer() → SDP offer → Server → B
B: createAnswer() → SDP answer → Server → A
```

### 3. ICE CANDIDATE EXCHANGE
```
A: ICE candidates → Server → B
B: ICE candidates → Server → A
```

### 4. DOĞRUDAN P2P BAĞLANTI
```
Kişi A ←→←→←→←→ Kişi B (Doğrudan)
```

## UYGULAMA SEÇENEKLERİ:

### KOLAY YÖNTEM:
- Socket.IO + Express server
- Heroku/Vercel deployment
- 10-15 dakika setup

### ZOR YÖNTEM:
- STUN/TURN servers
- ICE gathering
- Custom signaling
- NAT traversal

Hangi yöntemi tercih ediyorsunuz?