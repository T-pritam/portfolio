import './style.css';
import confetti from 'canvas-confetti';
import { initHeroScene } from './three-scene.js';
import { initAnimations } from './animations.js';
import { initCursor } from './cursor.js';

initHeroScene();
initAnimations();
initCursor();

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
