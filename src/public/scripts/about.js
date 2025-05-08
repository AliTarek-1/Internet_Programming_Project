// About Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Initialize any about page specific functionality
  initAboutPage();
  
  // Initialize cart sidebar functionality
  initCartSidebar();
});

// Initialize cart sidebar functionality
function initCartSidebar() {
  // Add event listeners for cart icon and close button
  document.addEventListener('click', function(e) {
    if (e.target.closest('.cart-icon') || e.target.closest('.cart-count')) {
      toggleCart();
    }
    
    if (e.target.closest('.close-cart')) {
      closeCart();
    }
    
    if (!e.target.closest('.cart-sidebar') && !e.target.closest('.cart-icon') && !e.target.closest('.cart-count')) {
      const cartSidebar = document.querySelector('.cart-sidebar');
      if (cartSidebar && cartSidebar.classList.contains('open')) {
        closeCart();
      }
    }
  });
}

// Toggle cart sidebar
function toggleCart() {
  const cartSidebar = document.querySelector('.cart-sidebar');
  if (cartSidebar) {
    cartSidebar.classList.toggle('open');
    
    if (cartSidebar.classList.contains('open')) {
      // Load cart items when opening
      if (typeof loadCartItems === 'function') {
        loadCartItems();
      }
    }
  }
}

// Close cart sidebar
function closeCart() {
  const cartSidebar = document.querySelector('.cart-sidebar');
  if (cartSidebar) {
    cartSidebar.classList.remove('open');
  }
}

// Initialize about page functionality
function initAboutPage() {
  // Load team members
  loadTeamMembers();
  
  // Initialize testimonial slider
  initTestimonialSlider();
  
  // Initialize company history timeline
  initTimeline();
}

// Load team members data
function loadTeamMembers() {
  const teamContainer = document.querySelector('.team-members');
  if (!teamContainer) return;
  
  // Sample team members data (in a real app, this would come from an API)
  const teamMembers = [
    {
      name: 'John Smith',
      position: 'CEO & Founder',
      bio: 'John founded BrandStore with a vision to create high-quality, affordable fashion for everyone.',
      image: 'images/team/team1.jpg'
    },
    {
      name: 'Sarah Johnson',
      position: 'Creative Director',
      bio: 'With over 15 years in the fashion industry, Sarah leads our creative vision and design team.',
      image: 'images/team/team2.jpg'
    },
    {
      name: 'Michael Chen',
      position: 'Head of Operations',
      bio: 'Michael ensures our supply chain and operations run smoothly to deliver the best products to our customers.',
      image: 'images/team/team3.jpg'
    },
    {
      name: 'Emily Rodriguez',
      position: 'Marketing Director',
      bio: 'Emily develops our brand strategy and marketing campaigns to connect with our customers.',
      image: 'images/team/team4.jpg'
    }
  ];
  
  // Create and append team member cards
  teamMembers.forEach(member => {
    const memberCard = document.createElement('div');
    memberCard.className = 'team-member';
    
    memberCard.innerHTML = `
      <div class="member-image">
        <div class="image-placeholder">
          <i class="fas fa-user"></i>
        </div>
      </div>
      <div class="member-info">
        <h3>${member.name}</h3>
        <p class="position">${member.position}</p>
        <p class="bio">${member.bio}</p>
        <div class="social-links">
          <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
          <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
          <a href="#" aria-label="Email"><i class="fas fa-envelope"></i></a>
        </div>
      </div>
    `;
    
    teamContainer.appendChild(memberCard);
  });
}

// Initialize testimonial slider
function initTestimonialSlider() {
  const testimonialSlider = document.querySelector('.testimonial-slider');
  if (!testimonialSlider) return;
  
  const testimonials = testimonialSlider.querySelectorAll('.testimonial');
  const prevBtn = testimonialSlider.querySelector('.prev-btn');
  const nextBtn = testimonialSlider.querySelector('.next-btn');
  
  let currentIndex = 0;
  
  // Show initial testimonial
  showTestimonial(currentIndex);
  
  // Add event listeners to buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
      showTestimonial(currentIndex);
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % testimonials.length;
      showTestimonial(currentIndex);
    });
  }
  
  // Function to show testimonial at specified index
  function showTestimonial(index) {
    testimonials.forEach((testimonial, i) => {
      if (i === index) {
        testimonial.classList.add('active');
      } else {
        testimonial.classList.remove('active');
      }
    });
  }
  
  // Auto-rotate testimonials
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      currentIndex = (currentIndex + 1) % testimonials.length;
      showTestimonial(currentIndex);
    }
  }, 5000);
}

// Initialize company history timeline
function initTimeline() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  // Add animation when timeline items come into view
  if (timelineItems.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    
    timelineItems.forEach(item => {
      observer.observe(item);
    });
  }
}
