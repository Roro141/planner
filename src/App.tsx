import "./App.css";

const dateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default function App() {
  return (
    <main className="page">
      <header className="page-header">
        <p className="page-header__note">today is</p>
        <h1 className="page-header__date">{dateFormat.format(new Date())}</h1>
      </header>

      <input
        className="quick-add"
        type="text"
        placeholder="Add a task — try “finish assignment tomorrow 6pm”"
        aria-label="Add a task"
      />

      <p className="empty-note">a clear page.</p>
    </main>
  );
}
