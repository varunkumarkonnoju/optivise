import { useNavigate } from 'react-router-dom'
import './Legal.css'

export default function TermsPage() {
  const navigate = useNavigate()
  const date = 'April 24, 2026'

  return (
    <div className="legal-page">
      <nav className="legal-nav">
        <div className="legal-logo" onClick={() => navigate('/home')}>
          <div className="legal-logo-icon">
            <svg viewBox="0 0 32 32" fill="none" width="18" height="18">
              <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="2"/>
              <path d="M10 22L16 10l6 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 18h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span>Optivise</span>
        </div>
        <button className="legal-back" onClick={() => navigate('/home')}>← Back to home</button>
      </nav>

      <div className="legal-content">
        <div className="legal-header">
          <h1>Terms of Service</h1>
          <p>Last updated: {date}</p>
        </div>

        <div className="legal-body">
          <Section title="1. Acceptance of Terms">
            By accessing or using Optivise ("Service") at optiviseai.io, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service. These terms apply to all users, including free and paid accounts.
          </Section>

          <Section title="2. Description of Service">
            Optivise is an AI-powered growth optimization platform for Shopify store owners. The Service includes:
            <ul>
              <li>AI-powered product description generation</li>
              <li>Store analytics and performance dashboards</li>
              <li>A/B testing tools</li>
              <li>AI growth recommendations</li>
              <li>Bulk product optimization tools</li>
            </ul>
          </Section>

          <Section title="3. Account Registration">
            To use the Service, you must create an account. You agree to:
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Be responsible for all activity that occurs under your account</li>
            </ul>
            You must be at least 18 years old to use the Service.
          </Section>

          <Section title="4. Shopify Integration">
            To use our Service, you will provide your Shopify store API credentials. By doing so, you:
            <ul>
              <li>Confirm you are the owner or authorized administrator of the Shopify store</li>
              <li>Grant us permission to read and write product data on your behalf</li>
              <li>Agree that we may use your store data to provide the Service</li>
            </ul>
            You can revoke access at any time by removing the API credentials from your account settings.
          </Section>

          <Section title="5. AI Generated Content">
            Our Service uses artificial intelligence to generate product descriptions and recommendations. You acknowledge that:
            <ul>
              <li>AI-generated content may not always be accurate or appropriate</li>
              <li>You are responsible for reviewing all AI-generated content before publishing</li>
              <li>We do not guarantee the quality, accuracy, or fitness of AI-generated content</li>
              <li>You retain full ownership of content published to your Shopify store</li>
            </ul>
          </Section>

          <Section title="6. Subscription and Billing">
            <p><strong>Free Plan:</strong> Available at no cost with limited features as described on our pricing page.</p>
            <p><strong>Paid Plans:</strong> Starter ($29/mo) and Growth ($79/mo) plans are billed monthly.</p>
            <p><strong>Free Trial:</strong> Paid plans include a 14-day free trial. You will not be charged until the trial ends.</p>
            <p><strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No refunds for partial months.</p>
            <p><strong>Price Changes:</strong> We reserve the right to change pricing with 30 days notice.</p>
          </Section>

          <Section title="7. Acceptable Use">
            You agree not to:
            <ul>
              <li>Use the Service for any illegal purpose</li>
              <li>Violate Shopify's terms of service</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use the Service to generate spam, misleading, or harmful content</li>
              <li>Resell or sublicense the Service without our written permission</li>
              <li>Reverse engineer or copy any part of the Service</li>
            </ul>
          </Section>

          <Section title="8. Intellectual Property">
            The Service and its original content, features, and functionality are owned by Optivise and are protected by international copyright, trademark, and other intellectual property laws. You retain ownership of your store data and any content you create using the Service.
          </Section>

          <Section title="9. Disclaimer of Warranties">
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES. WE DO NOT GUARANTEE ANY SPECIFIC RESULTS FROM USE OF THE SERVICE, INCLUDING INCREASED REVENUE OR CONVERSION RATES.
          </Section>

          <Section title="10. Limitation of Liability">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, OPTIVISE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES, ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM.
          </Section>

          <Section title="11. Indemnification">
            You agree to indemnify and hold harmless Optivise, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Service, violation of these Terms, or violation of any third-party rights.
          </Section>

          <Section title="12. Termination">
            We may terminate or suspend your account at any time for violation of these Terms. Upon termination, your right to use the Service ceases immediately. We will delete your data within 30 days of termination.
          </Section>

          <Section title="13. Governing Law">
            These Terms shall be governed by the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
          </Section>

          <Section title="14. Changes to Terms">
            We reserve the right to modify these Terms at any time. We will notify you of significant changes via email or a notice on our website. Continued use of the Service after changes constitutes acceptance of the new Terms.
          </Section>

          <Section title="15. Contact Us">
            If you have questions about these Terms, please contact us at:
            <ul>
              <li>Email: legal@optiviseai.io</li>
              <li>Website: optiviseai.io</li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="legal-section">
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  )
}