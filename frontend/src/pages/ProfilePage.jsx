import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="page-stack">
      <section className="panel">
        <h1>Profile</h1>
        <p>Personal details used to personalize your nutrition tracking.</p>
      </section>

      <section className="panel profile-grid">
        <article className="profile-card">
          <span>Name</span>
          <strong>{user?.name || 'N/A'}</strong>
        </article>
        <article className="profile-card">
          <span>Email</span>
          <strong>{user?.email || 'N/A'}</strong>
        </article>
        <article className="profile-card">
          <span>Age</span>
          <strong>{user?.age ?? 'N/A'}</strong>
        </article>
        <article className="profile-card">
          <span>Weight</span>
          <strong>{user?.weight ?? 'N/A'}</strong>
        </article>
        <article className="profile-card profile-card-wide">
          <span>Goal</span>
          <strong>{user?.goal || 'Maintain weight'}</strong>
        </article>
      </section>
    </div>
  );
};

export default ProfilePage;
