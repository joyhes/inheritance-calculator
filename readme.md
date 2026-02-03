# 🧮 Taiwan Inheritance Calculator

A professional, aesthetic inheritance distribution tool strictly adhering to the ROC (Taiwan) Civil Code.

## ✨ Key Features
- **Comprehensive Legal Logic**: Full support for 1st-4th priority heirs, representation (right of subrogation), and complex spousal share rules.
- **Interactive Family Tree**: Real-time management of family structures including living/deceased status and divorce.
- **Synced Calculation Tracking**: hover over a source breakdown to see the exact corresponding part in the mathematical formula.
- **Performance Optimized**: Effortlessly handles large family trees (50+ members) using segment loading and smart chart grouping.
- **Data Persistence**: Your work is automatically saved to LocalStorage, ensuring data is never lost on refresh.
- **Professional PDF Reports**: Specialized A4 print layout designed for legal documentation and paper efficiency.

## 🚀 Operation Guide
1. **Input Data**: Click "Add Member" to build your family tree. Define parents and spouses to establish legal relationships.
2. **Define Status**: Ensure the "Deceased" date is set for the primary individual and any relevant ancestors.
3. **Set Waivers**: If an heir has waived inheritance, use the waiver management tool to reflect this in real-time.
4. **Select Deceased**: Use the dropdown or selector to mark the person whose estate is being distributed.
5. **Analyze Result**: View the distribution breakdown. Hover over calculation blocks to trace the logic.
6. **Export**: Click the Print button for a clean PDF report or use the Copy icon to grab individual share data.

---
*Created with focus on legal precision and modern aesthetics.*

## 📂 Project Structure
```text
├── .github/workflows/   # CI/CD: Auto-deploy to GitHub Pages
├── components/          # UI Components
│   ├── FamilyTree.tsx   # Interactive visual pedigree tree
│   ├── ResultSection.tsx# Performance-optimized results & charts
│   ├── PersonModal.tsx  # Member editor with relationship logic
│   └── LegalReference.tsx# Taiwan Civil Code reference panel
├── services/
│   └── logic.ts         # High-precision fraction calculation engine
├── App.tsx              # Main application logic & state management
├── types.ts             # Data models & inheritance types
├── index.css            # Global styles (Tailwind + Custom patterns)
└── readme.md            # You are here
```
