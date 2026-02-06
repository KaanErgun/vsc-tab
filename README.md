# VSC Tab

**Manage multiple projects in a single VS Code window with tabs**

VSC Tab, birden fazla projeyi tek bir VS Code penceresinde yönetmenizi sağlayan bir extension'dır. Artık farklı projeler için ayrı VS Code pencereleri açmanıza gerek yok!

## Features

### 🗂️ Project Management
- **Add Projects**: Sidebar'daki "+" butonu ile projelerinizi ekleyin
- **Remove Projects**: İstemediğiniz projeleri listeden kaldırın
- **Quick Switch**: Tek tıklamayla projeler arasında geçiş yapın

### 🖥️ Multi-Root Workspace Support
- Projeler VS Code'un multi-root workspace özelliğiyle açılır
- Tüm projeleriniz aynı pencerede, Explorer'da görünür
- Her projenin dosyalarına kolayca erişin

### 🚀 Open in New Window
- İsterseniz bir projeyi yeni bir pencerede açabilirsiniz

## Usage

1. **Sol Activity Bar'da VSC Tab ikonuna tıklayın**
2. **"+" butonu ile proje ekleyin**
3. **Proje adına tıklayarak workspace'e ekleyin**
4. **Explorer'dan dosyalara erişin**

## Commands

| Command | Description |
|---------|-------------|
| `VSC Tab: Add Project` | Yeni bir proje ekle |
| `VSC Tab: Remove Project` | Projeyi listeden kaldır |
| `VSC Tab: Open Project` | Projeyi workspace'e ekle |
| `VSC Tab: Refresh Projects` | Proje listesini yenile |
| `VSC Tab: Open in New Window` | Projeyi yeni pencerede aç |

## Installation

1. VS Code'da Extensions panelini açın (`Ctrl+Shift+X`)
2. "VSC Tab" arayın
3. Install butonuna tıklayın

## Development

```bash
# Clone the repository
git clone https://github.com/yourusername/vsc-tab.git

# Install dependencies
npm install

# Compile
npm run compile

# Watch mode
npm run watch
```

## Testing the Extension

1. `F5` tuşuna basarak Extension Development Host'u başlatın
2. Yeni pencerede VSC Tab ikonunu sidebar'da göreceksiniz
3. Projeleri ekleyip test edin

## Known Issues

- İlk seferde workspace boşsa, projeyi ekledikten sonra VS Code'un yeniden başlaması gerekebilir

## Release Notes

### 0.0.1

- İlk sürüm
- Proje ekleme/kaldırma
- Multi-root workspace desteği
- Yeni pencerede açma özelliği

## License

MIT

**Enjoy!** 🎉
