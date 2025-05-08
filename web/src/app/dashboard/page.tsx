export default function Dashboard() {
  const outstandingRequests = 0;

  return (
    <div>
      {outstandingRequests > 0 && <p>Outstanding requests: {outstandingRequests}</p>}
      <div>
        <button>Studies</button>
        <button>Projects</button>
        <button>Assets</button>
      </div>
    </div>
  );
}
