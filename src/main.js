import AOS from 'aos';
import 'aos/dist/aos.css';
import confetti from 'canvas-confetti';

// Initialize AOS
AOS.init({
    duration: 1000,
    easing: 'ease-out-cubic',
    once: true,
    offset: 50,
});

// Particle Effect (Simple Canvas background)
const initParticles = () => {
    // This is a placeholder for a more complex particle system if desired.
    // For now, we rely on the CSS gradient animation.
    // If you want actual canvas particles, we can add them here.
};

// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle?.classList.remove('active');
    });
});

// Scroll to Top Button
const scrollTop = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTop?.classList.add('show');
    } else {
        scrollTop?.classList.remove('show');
    }
});

scrollTop?.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Hero Image Hover Effect (Tilt)
const heroImage = document.querySelector('.hero-image');
heroImage?.addEventListener('mousemove', (e) => {
    const { offsetWidth: w, offsetHeight: h } = heroImage;
    const { offsetX: x, offsetY: y } = e;
    const move = 20;
    const xMove = (x / w * move * 2) - move;
    const yMove = (y / h * move * 2) - move;

    heroImage.style.transform = `translate(${xMove}px, ${yMove}px) scale(1.05)`;
});

heroImage?.addEventListener('mouseleave', () => {
    heroImage.style.transform = '';
});


// Confetti on "Get In Touch" or specific actions
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        const rect = btn.getBoundingClientRect();
        // confetti({
        //     particleCount: 30,
        //     spread: 50,
        //     origin: { 
        //         x: (rect.left + rect.width / 2) / window.innerWidth, 
        //         y: (rect.top + rect.height / 2) / window.innerHeight 
        //     },
        //     disableForReducedMotion: true
        // });
    });
});

// Form Submission with Brevo
const contactForm = document.getElementById('contactForm');

contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // Validate
    if (!data.name || !data.email || !data.message) {
        alert('Please fill in all required fields.');
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        return;
    }

    const apiKey = import.meta.env.VITE_BREVO_API_KEY;

    if (!apiKey) {
        console.error('Brevo API Key is missing! Check your .env file.');
        alert('Email service is currently unavailable (Missing API key configuration).');
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        return;
    }

    console.log('Attempting to send email via Brevo...');

    try {
        const payload = {
            sender: {
                name: "Portfolio Contact Form",
                email: "mail@portfolio.pritamrao.tech" // Verified sender in Brevo
            },
            to: [
                {
                    email: "pritamrao38@gmail.com", // Your receiving email
                    name: "T Pritam"
                }
            ],
            subject: `Portfolio Contact: ${data.subject || 'New Message'}`,
            htmlContent: `
                <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
                            <h2 style="color: #d946ef; border-bottom: 2px solid #d946ef; padding-bottom: 10px;">New Message from Portfolio</h2>
                            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                                <p><strong style="color: #666;">From:</strong> ${data.name}</p>
                                <p><strong style="color: #666;">Email:</strong> <a href="mailto:${data.email}" style="color: #d946ef; text-decoration: none;">${data.email}</a></p>
                                <p><strong style="color: #666;">Subject:</strong> ${data.subject}</p>
                                <p><strong style="color: #666;">Message:</strong></p>
                                <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #d946ef; margin-top: 10px;">
                                    ${data.message.replace(/\n/g, '<br>')}
                                </div>
                            </div>
                            <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                                <p style="margin: 0; font-size: 14px;"><strong>Sender Details:</strong></p>
                                <p style="margin: 5px 0 0 0; font-size: 14px;">
                                    Reply to: <a href="mailto:${data.email}" style="color: #0066cc;">${data.email}</a>
                                </p>
                            </div>
                            <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
                                This message was sent from your portfolio contact form at ${new Date().toLocaleString()}
                            </p>
                        </div>
                    </body>
                </html>
            `,
            replyTo: {
                email: data.email,
                name: data.name
            }
        };

        console.log('Brevo API payload:', JSON.stringify(payload, null, 2));

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const responseData = await response.json();
        console.log('Brevo API Response:', responseData);

        if (response.ok) {
            console.log('✅ Email sent successfully!', responseData);

            // Show confetti celebration
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            // Reset form
            contactForm.reset();
        } else {
            console.error('❌ Brevo API Error:', {
                status: response.status,
                statusText: response.statusText,
                error: responseData
            });

            // Provide helpful error messages
            let errorMessage = 'Failed to send message. ';
            if (responseData.code === 'unauthorized') {
                errorMessage += 'Invalid API key. Please check your Brevo configuration.';
            } else if (responseData.code === 'invalid_parameter') {
                errorMessage += 'Invalid email configuration. Please ensure the sender email is verified in Brevo.';
            } else if (responseData.message) {
                errorMessage += responseData.message;
            } else {
                errorMessage += 'Please try again later.';
            }

            alert(errorMessage);
        }
    } catch (error) {
        console.error('❌ Network/Fetch Error:', error);
        alert('An error occurred while sending your message. Please check your internet connection and try again.');
    } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
});
