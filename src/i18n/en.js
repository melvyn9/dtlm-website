/**
 * English UI strings.
 *
 * Brief §10 (language): the client chose English at launch, with the site
 * structured so Bahasa Malaysia can be added later without a rewrite.
 *
 * That is what this file is for. Every piece of interface text lives here
 * rather than being hardcoded in templates. Adding Bahasa Malaysia means:
 *   1. copy this file to ms.js and translate the values
 *   2. add 'ms' to `locales` in astro.config.mjs
 *   3. add a language switcher to SiteHeader.astro
 *
 * Project and team *content* lives in Markdown, not here.
 */

export default {
  'nav.skip': 'Skip to main content',
  'nav.primary': 'Primary',
  'nav.footer': 'Legal and accessibility',
  'nav.home': 'Home',
  'nav.works': 'Works',
  'nav.awards': 'Awards',
  'nav.news': 'News & Press',
  'nav.exhibitions': 'Exhibitions',
  'nav.museums': 'Art Museums',
  'nav.books': 'Books & Ideas',
  'nav.contact': 'Contact',
  'nav.accessibility': 'Accessibility',
  'nav.privacy': 'Privacy',

  'home.selected': 'Selected works',

  'project.details': 'Project details',
  'project.year': 'Year',
  'project.location': 'Location',
  'project.status': 'Status',
  'project.typology': 'Typology',
  'project.area': 'Area',
  'project.client': 'Client',
  'project.team': 'Project team',
  'project.consultants': 'Consultants',
  'project.awards': 'Awards',
  'project.publications': 'Publications',
  'project.photography': 'Photography',
  'project.close': 'Close',

  'press.title': 'News & Press',
  'press.awards': 'Awards',
  'press.publications': 'Publications',
  'press.speaking': 'Speaking engagements',
  'press.exhibitions': 'Exhibitions',
  'press.museums': 'Art Museums',
  'press.books': 'Books & Ideas',
  'press.comingSoon': 'Coming soon.',
  'press.external': 'Opens in a new tab',

  'contact.title': 'Contact',
  'contact.formTitle': 'Make an enquiry',
  'contact.name': 'Your name',
  'contact.email': 'Your email address',
  'contact.subject': 'Subject',
  'contact.message': 'Message',
  'contact.submit': 'Send enquiry',
  'contact.required': 'required',
  'contact.viewMap': 'View on Google Maps',
  'contact.address': 'Address',
  'contact.phone': 'Telephone',
  'contact.emailLabel': 'Email',

  'status.built': 'Built',
  'status.under-construction': 'Under construction',
  'status.competition': 'Competition',
  'status.unbuilt': 'Unbuilt',

  'typology.residential': 'Residential',
  'typology.commercial': 'Commercial',
  'typology.civic': 'Civic',
  'typology.institutional': 'Institutional',
  'typology.interior': 'Interior',

  'error.404.title': 'Page not found',
  'error.404.body':
    'This page may have moved when the site was rebuilt. The homepage is the best place to start.',
};
