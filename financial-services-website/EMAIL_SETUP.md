# Contact form emails — setup steps

Your contact form (contact.html) already submits to Netlify Forms. I've added
a Netlify Function (netlify/functions/submission-created.js) that runs
automatically every time someone submits the form. It sends two emails using
Resend (a transactional email service):

1. A notification to your team: "<Name> has contacted us regarding
   <Service> and we must get back to them" — with their name, surname,
   phone, email, enquiry type and message.
2. A confirmation to the visitor: their email has been sent successfully
   and someone will be in touch with them soon.

The site isn't live yet, so this doc starts with getting it deployed to
Netlify, then covers the email setup. I can't create accounts, verify
domains, or click through Netlify's UI for you — these steps need you.

## 1. Deploy the site to Netlify

1. Go to https://app.netlify.com and sign up / log in (free).
2. Easiest option for a first deploy — drag and drop:
   - From your dashboard, go to "Sites" and look for the drag-and-drop area
     (usually says "Drag and drop your site output folder here" or similar
     under "Add new site" -> "Deploy manually").
   - Drag your whole `financial-services-website` folder (the one
     containing index.html, contact.html, the netlify.toml I added, etc.)
     into that area.
   - Netlify uploads it and gives you a live URL like
     random-name-123abc.netlify.app within a minute or two.
   - Netlify will auto-detect the "contact" form in contact.html and the
     function in netlify/functions/ — no extra config needed for those.
3. Alternative (recommended long-term, since it makes future updates a
   redeploy instead of a re-drag) — connect a Git repository:
   - Put the folder in a GitHub/GitLab/Bitbucket repo.
   - In Netlify: "Add new site" -> "Import an existing project" -> connect
     the repo. Build command: leave blank. Publish directory: the folder
     containing index.html (root, or wherever it sits in the repo).
4. Once deployed, you can rename the auto-generated URL under Site
   settings -> Domain management, or connect your own domain
   (distinctivewealth.co.za) there when you're ready to point it live.

Everything below works the same regardless of which deploy method you pick.

## 2. Create a Resend account and API key

1. Go to https://resend.com and sign up (free tier: 3,000 emails/month).
2. Verify your sending domain: Resend dashboard -> Domains -> Add Domain ->
   enter distinctivewealth.co.za, then add the DNS records it gives you at
   wherever your domain's DNS is managed. This can take a few minutes to a
   few hours to verify.
   - Until the domain is verified, the function will fall back to Resend's
     shared test address (onboarding@resend.dev), which works for testing
     but looks less professional and has stricter sending limits.
3. Once verified, go to API Keys -> Create API Key and copy it (you'll only
   see it once).

## 3. Add environment variables in Netlify

In your Netlify dashboard: Site settings -> Environment variables -> Add a
variable, and add:

| Key | Value |
|---|---|
| RESEND_API_KEY | the API key from step 2 |
| CONTACT_NOTIFY_EMAIL | info@distinctivewealth.co.za (or whichever inbox should get enquiries — confirm the exact address) |
| CONTACT_FROM_EMAIL | Distinctive Wealth Management <noreply@distinctivewealth.co.za> |

CONTACT_FROM_EMAIL must use your verified domain once step 2.2 is done —
otherwise leave it unset and it will default to Resend's test sender.

After adding/changing environment variables, trigger a new deploy (Netlify
-> Deploys -> Trigger deploy) so the function picks them up.

## 4. Test it

Submit the contact form on your live Netlify URL with a real email address
you can check. You should receive the notification email at
CONTACT_NOTIFY_EMAIL, and the address you entered in the form should
receive the confirmation email. Check Netlify's Functions log (Site ->
Functions -> submission-created) if something doesn't arrive — it will show
errors from Resend if the API key or domain isn't set up correctly yet.

## Notes

- Netlify's own spam filter (the honeypot field already in the form) blocks
  most bots before the function even runs.
- If you'd rather use SendGrid, Mailgun, or another provider instead of
  Resend, the function only needs its "sendEmail" call adjusted to that
  provider's API — the rest of the logic stays the same.
