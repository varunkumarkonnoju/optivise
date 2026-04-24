import { useNavigate } from 'react-router-dom'
import './Legal.css'

export default function PrivacyPage() {
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
          <h1>Privacy Policy</h1>
          <p>Last updated: {date}</p>
        </div>

        <div className="legal-body">
          <Section title="1. Introduction">
            Welcome to Optivise ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our services at optivise.io (the "Service").
          </Section>

          <Section title="2. Information We Collect">
            <p><strong>Information you provide to us:</strong></p>
            <ul>
              <li>Account information: name, email address, password</li>
              <li>Store information: Shopify store domain and API credentials</li>
              <li>Payment information: processed securely by Stripe — we never store card details</li>
              <li>Communications: messages you send to our AI assistant</li>
            </ul>
            <p><strong>Information we collect automatically:</strong></p>
            <ul>
              <li>Store data: product information, order data, and analytics pulled from your Shopify store via API</li>
              <li>Usage data: how you interact with our dashboard</li>
              <li>Log data: IP address, browser type, pages visited</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            We use the information we collect to:
            <ul>
              <li>Provide, maintain, and improve our Service</li>
              <li>Process your payments through Stripe</li>
              <li>Connect to your Shopify store to display analytics and generate AI content</li>
              <li>Send you service-related emails (account confirmations, billing receipts)</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze usage patterns to improve the Service</li>
            </ul>
          </Section>

          <Section title="4. Shopify Data">
            To provide our Service, we connect to your Shopify store using the API credentials you provide. We access:
            <ul>
              <li>Product information (titles, descriptions, images, prices)</li>
              <li>Order data (revenue, order counts, product sales)</li>
            </ul>
            This data is used solely to display analytics and generate AI-powered content for your store. We do not sell or share your Shopify data with third parties. You can revoke our access at any time by uninstalling the app from your Shopify admin.
          </Section>

          <Section title="5. AI Generated Content">
            Our Service uses OpenAI's GPT-4 to generate product descriptions. When you use this feature, your product information (title, price, type) is sent to OpenAI's API to generate content. Please review OpenAI's privacy policy at openai.com/privacy for information on how they handle data.
          </Section>

          <Section title="6. Payment Processing">
            All payments are processed by Stripe, Inc. We do not store your credit card information. Stripe's privacy policy is available at stripe.com/privacy. By using our paid plans, you agree to Stripe's terms of service.
          </Section>

          <Section title="7. Data Sharing">
            We do not sell your personal information. We may share your information with:
            <ul>
              <li><strong>Service providers:</strong> Supabase (database), OpenAI (AI generation), Stripe (payments)</li>
              <li><strong>Legal requirements:</strong> when required by law or to protect our rights</li>
            </ul>
          </Section>

          <Section title="8. Data Security">
            We implement appropriate technical and organizational measures to protect your information. However, no method of transmission over the Internet is 100% secure. Your passwords are hashed and never stored in plain text. API credentials are encrypted in transit.
          </Section>

          <Section title="9. Data Retention">
            We retain your information for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal purposes.
          </Section>

          <Section title="10. Your Rights">
            You have the right to:
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data</li>
              <li>Opt out of marketing emails</li>
            </ul>
            To exercise these rights, contact us at privacy@optivise.io
          </Section>

          <Section title="11. Cookies">
            We use essential cookies to maintain your login session. We do not use tracking or advertising cookies. You can disable cookies in your browser settings, but this may affect functionality.
          </Section>

          <Section title="12. Children's Privacy">
            Our Service is not directed to children under 13. We do not knowingly collect personal information from children under 13.
          </Section>

          <Section title="13. Changes to This Policy">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. Continued use of the Service after changes constitutes acceptance of the new policy.
          </Section>

          <Section title="14. Contact Us">
            If you have questions about this Privacy Policy, please contact us at:
            <ul>
              <li>Email: privacy@optivise.io</li>
              <li>Website: optivise.io</li>
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