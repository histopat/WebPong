# 🏓 WebPong

WebPong, ASP.NET Core Razor Pages ve C# kullanılarak geliştirilmiş klasik Pong oyununun modern bir klonudur.  
Visual Studio 2026 üzerinde derlenebilir ve tarayıcıda oynanabilir.

## 🎮 Özellikler

- **Menü sistemi**: Oyun türü ve zorluk seçimi yapılabilir.
- **Tek oyuncu modu**: Yapay zekâ rakip için üç zorluk seviyesi (Kolay, Orta, Zor).
- **İki oyuncu modu**: İki kişi aynı klavyeden oynayabilir.
- **Renkli tasarım**: Sol raket (yeşil), sağ raket (kırmızı), top (turuncu).
- **Skor takibi**: 10 puana ulaşan oyuncu oyunu kazanır.
- **Duraklat/Sıfırla** seçenekleri.


## ⚙️ Derleme

1. Visual Studio 2026 ile derleme yapılabilir. "ASP.NET web geliştirme" iş yükü kurulu olmalıdır.
2. Projeyi klonlayıp istediğiniz değişiklikleri yaparak derleyebilirsiniz.
3. F5 ile çalıştırın.

## 🕹️ Kontroller

### Tek Oyuncu
- **Sol raket**: `W` (yukarı), `S` (aşağı)
- **Sağ raket**: Yapay zekâ tarafından kontrol edilir

### İki Oyuncu
- **Sol raket (Oyuncu 1)**: `W` (yukarı), `S` (aşağı)
- **Sağ raket (Oyuncu 2)**: `O` (yukarı), `L` (aşağı)

### Genel
- **Duraklat / Devam**: `P`
- Menüdeki butonlarla **Başlat**, **Duraklat**, **Sıfırla** işlemleri yapılabilir.

## 🤖 Yapay Zekâ Zorlukları

- **Kolay**: Yavaş takip, gecikmeli reaksiyon, yüksek hata payı.
- **Orta**: Dengeli hız ve reaksiyon.
- **Zor**: Hızlı takip, düşük gecikme, minimum hata.

## 🖼️ Görsel Tasarım

- Arka plan: Koyu tema
- Sol raket: Yeşil
- Sağ raket: Kırmızı
- Top: Turuncu
- Orta çizgi: Gri tonlu net

## 🏆 Oyun Kuralları

- Top raketi geçip kenara çarptığında rakip oyuncu 1 puan kazanır.
- İlk 10 puana ulaşan oyuncu oyunu kazanır.
- Skorlar üst panelde gösterilir.

## Ekran Görüntüsü
<img width="1852" height="855" alt="Ekran görüntüsü 2025-12-29 161836" src="https://github.com/user-attachments/assets/3bff9cd1-ce57-4fc6-be43-d0a709d0a855" />


## 📜 Lisans

Bu proje eğitim ve öğrenim amaçlıdır. Serbestçe kullanılabilir ve geliştirilebilir.
