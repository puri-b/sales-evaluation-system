/**
 * โครงหน้าหลักของแอป: แถบเมนูซ้ายสีม่วงเข้ม + แบนเนอร์หัวข้อ
 * สไตล์อยู่ใน styles/globals.css (คลาส .app-*)
 */
const NAV = [
  { key: 'main', label: 'ประเมินใหม่', icon: '＋' },
  { key: 'list', label: 'ข้อมูลการประเมิน', icon: '☰' },
  { key: 'settings', label: 'ตั้งค่าต้นทุน', icon: '⚙' },
];

export default function AppShell({ active, title, subtitle, actions, onNavigate, children }) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar no-print">
        <div className="app-brand">
          <div className="app-brand-mark">SE</div>
          <div>
            <div className="app-brand-name">Sales Evaluation</div>
            <div className="app-brand-sub">SO NEXT</div>
          </div>
        </div>
        <div className="app-nav-group">เมนูหลัก</div>
        <nav>
          {NAV.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`app-nav-item${active === item.key ? ' is-active' : ''}`}
              aria-current={active === item.key ? 'page' : undefined}
              onClick={() => onNavigate(item.key)}
            >
              <span className="app-nav-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="app-sidebar-foot">ระบบประเมินงานสแกนและบันทึกข้อมูล</div>
      </aside>

      <main className="app-main">
        <div className="app-main-inner">
          <header className="app-banner no-print">
            <div>
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>
            {actions}
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
