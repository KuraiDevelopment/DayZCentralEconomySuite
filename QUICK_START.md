# Quick Start Guide - DayZ Economy Manager

## 🚀 Getting Started (5 Minutes)

### Step 1: Start the Development Server

The server is already running! Open your browser and navigate to:

**http://localhost:3001**

(Note: If port 3000 is in use, the app automatically uses 3001)

---

## 📋 What You Can Do Right Now

### 1. **Home Dashboard** (/)
- View all available features
- Navigate to different tools
- See project statistics

### 2. **XML Parser** (/xml-parser)
- Upload your DayZ types.xml file
- Parse and validate the file
- View all items in a table
- See statistics about your economy

### 3. **Try These Features:**

#### Parse a Types.xml File:
1. Go to http://localhost:3001/xml-parser
2. Drag and drop your `types.xml` file
3. View parsed items and statistics
4. Export back to XML or JSON

---

## 🎯 Quick Examples

### Example Types.xml Entry:
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<types>
    <type name="M4A1">
        <nominal>5</nominal>
        <lifetime>28800</lifetime>
        <restock>0</restock>
        <min>3</min>
        <quantmin>-1</quantmin>
        <quantmax>-1</quantmax>
        <cost>100</cost>
        <flags count_in_cargo="0" count_in_hoarder="0" count_in_map="1" count_in_player="0" crafted="0" deloot="0"/>
        <category name="weapons"/>
        <usage name="Military"/>
        <value name="Tier3"/>
    </type>
</types>
```

---

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

---

## 📁 Project Structure Overview

```
src/
├── app/                    # Pages and routes
│   ├── page.tsx           # Home page
│   ├── xml-parser/        # XML parser page
│   └── api/               # API endpoints
├── components/            # Reusable UI components
├── types/                 # TypeScript definitions
├── utils/                 # Helper functions
├── store/                 # State management
└── constants/             # App constants
```

---

## 🎨 Key Features Implemented

✅ **XML Parser** - Parse types.xml, events.xml, spawnable_types.xml, economy.xml  
✅ **Type Definitions** - Complete TypeScript types for all DayZ entities  
✅ **Validation System** - Validate item configurations  
✅ **State Management** - Zustand store for app state  
✅ **API Routes** - Backend endpoints for parsing, validation, export  
✅ **Modern UI** - Dark theme with Tailwind CSS  
✅ **Component Library** - FileUpload, ItemTable components  

---

## 🚦 Next Steps

### To expand this tool, consider adding:

1. **Item Editor** - Visual editor for individual items
2. **Category Manager** - Filter and group items by category
3. **Analytics Dashboard** - Charts and statistics
4. **Backup System** - Version control for configs
5. **Batch Operations** - Edit multiple items at once
6. **Templates** - Pre-built configurations

---

## 💡 Pro Tips

### For Server Administrators:

1. **Always backup** before editing configuration files
2. **Validate** your changes before deploying to server
3. **Test changes** on a staging server first
4. **Document** your configuration choices
5. **Monitor** spawn rates after changes

### For Economy Balance:

- **Nominal**: Total items that can spawn in world
- **Min**: Minimum items to maintain
- **Lifetime**: How long item persists (seconds)
- **Restock**: How often to check for respawn (seconds)
- **Tiers**: Loot rarity (Tier1=common, Tier4=rare)

---

## 🆘 Need Help?

### Common Issues:

**Q: Port 3000 is already in use**  
A: The app automatically uses 3001. Check the terminal for the actual port.

**Q: Changes not appearing**  
A: Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)

**Q: XML parsing fails**  
A: Ensure your XML is valid and follows DayZ schema

**Q: TypeScript errors**  
A: Run `npm install` to ensure all dependencies are installed

---

## 📚 Additional Resources

- [DayZ Server Files Documentation](https://community.bistudio.com/wiki/DayZ:Central_Economy)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🎮 Happy Server Managing!

Your DayZ Economy Manager is now ready to use. Start by uploading a types.xml file to the XML Parser and explore the features.

**Version**: 1.3.0  
**Status**: ✅ Production Ready  
**Port**: http://localhost:3000
