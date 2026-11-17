import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';

export default function NotFound({ what = 'page' }: { what?: string }) {
  return (
    <div className="page">
      <div className="state-msg">
        <Icon name="alert-circle" className="ico ico--lg" />
        <h1 className="h1">No such {what}</h1>
        <p className="lead">The link may be old or mistyped.</p>
        <div className="empty__actions">
          <Link to="/glossary" className="btn btn--primary"><Icon name="search" /> Search the glossary</Link>
          <Link to="/" className="btn btn--secondary">Home</Link>
        </div>
      </div>
    </div>
  );
}
