const PROFILE_KEY = "samuraii-profile";

const defaultProfile = {
  name: "",
  email: "",
  phone: "",
};

function getProfile() {
  try {
    return { ...defaultProfile, ...JSON.parse(localStorage.getItem(PROFILE_KEY)) };
  } catch {
    return { ...defaultProfile };
  }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "S";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function renderProfile() {
  const profile = getProfile();
  const hasName = Boolean(profile.name.trim());

  const avatar = document.querySelector("[data-profile-avatar]");
  const displayName = document.querySelector("[data-profile-display-name]");
  const displayEmail = document.querySelector("[data-profile-display-email]");
  const nameInput = document.querySelector("[data-profile-name]");
  const emailInput = document.querySelector("[data-profile-email]");
  const phoneInput = document.querySelector("[data-profile-phone]");

  if (avatar) avatar.textContent = getInitials(profile.name || "Samuraii");
  if (displayName) displayName.textContent = hasName ? profile.name : "Guest";
  if (displayEmail) {
    displayEmail.textContent = profile.email.trim()
      ? profile.email
      : "Sign in to save your details";
  }
  if (nameInput) nameInput.value = profile.name;
  if (emailInput) emailInput.value = profile.email;
  if (phoneInput) phoneInput.value = profile.phone;
}

function initProfileForm() {
  const form = document.querySelector("[data-profile-form]");
  const notice = document.querySelector("[data-profile-notice]");
  if (!form) return;

  renderProfile();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const profile = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
    };

    saveProfile(profile);
    renderProfile();

    if (notice) {
      notice.textContent = "Profile saved.";
      notice.hidden = false;
      window.setTimeout(() => {
        notice.hidden = true;
      }, 2400);
    }
  });
}

document.addEventListener("DOMContentLoaded", initProfileForm);
