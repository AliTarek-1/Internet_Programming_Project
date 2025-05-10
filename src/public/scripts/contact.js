// Simple form validation
document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (name && subject && email && message) {
    alert("Thank you! Your message has been sent.");
    this.reset();
  } else {
    alert("Please fill in all fields.");
  }
});
