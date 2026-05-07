function renderAllAvatars() {
  const user = getUser();
  if (!user) return;

  const name = user.fullName || user.username || 'User';
  const initials = getInitials(name);

  // Update all avatar elements
  document.querySelectorAll('.user-avatar').forEach(el => {
    el.textContent = initials;
    el.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--gradient-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: var(--text-sm);
      color: white;
      flex-shrink: 0;
      text-transform: uppercase;
    `;
  });

  // Header avatars
  document.querySelectorAll('.header-avatar').forEach(el => {
    el.textContent = initials;
    el.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--gradient-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: var(--text-sm);
      color: white;
      cursor: pointer;
      flex-shrink: 0;
      text-transform: uppercase;
    `;
  });

  // Sidebar name
  document.querySelectorAll('.user-name').forEach(el => {
    el.textContent = user.fullName || user.username;
  });

  // Role labels
  document.querySelectorAll('.user-role').forEach(el => {
    el.textContent = user.role === 'admin' ? 'Administrator' : 'User';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) {
    renderAllAvatars();
  }
});
