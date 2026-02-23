export type FAQItem = {
  q: string
  a: string
  bullets?: string[]
  nestedBullets?: Record<string, string[]>
  video?: string
  link?: { text: string; url: string }
}

export const FAQ: Record<string, FAQItem[]> = {
  General: [
    {
      q: 'What is shipwrights?',
      a: 'We review and certify ships from Hack Club orginized YSWS - Flavortown! \n Basically, we make sure your project is working and easy demoable before giving you that sweet approval. \n Think of us as your friendly project helpers :)',
    },
    {
      q: 'How long does it take?',
      a: 'Depends on the queue, but usually 1-7 days! Sometimes faster if we are vibing. Check out the /queue page for current stats!',
    },
    {
      q: 'What counts as a ship?',
      a: 'Anything you built! Websites, games, apps, bots, hardware projects - you name it! \n Just make sure it is working and easy to demo :)',
    },
    {
      q: 'How do I become a Shipwright?',
      a: 'Shipwrights are invite-only! We look for people who are consistently active, positive, helpful, and genuinely interested in being part of the team. Just be yourself, be friendly, and if you are doing great work, we will notice you :)',
    },
    {
      q: 'What language does my project need to be in?',
      a: 'Your project code can be in any programming language! However, your project description and devlogs need to be in English.',
    },
  ],
  'Ships! Ships! Ships!': [
    {
      q: 'What is a ship?',
      a: "Once you've made a project, you need to ship it so that the world can see what it is! Once a project is usable by other people and you've shared it we call that a \"ship\". This video explains what a ship is:",
      video: 'https://vimeo.com/1111478391?fl=pl&fe=sh',
    },
    {
      q: 'What counts as a ship?',
      a: "Any project that you've worked on yourself unless:",
      bullets: [
        'it was for school',
        'it was paid',
        "it's closed source",
        "it's a 1:1 replica of a tutorial - remix it and make it your own!",
      ],
    },
  ],
  'How do I ship it?': [
    {
      q: 'Overview',
      a: 'There are three essential parts to a shipped project:',
      bullets: [
        'A demo',
        'A repository with README',
        'Devlogs showing your development journey',
      ],
    },
    {
      q: 'Repository',
      a: "Your repository needs two things. The first is all of your amazing code! Everything we share at Hack Club has to be open source (even Flavortown). In most cases your code will be on GitHub, but you're welcome to use any Git host.\nThe second thing your repository needs is a good README.md file. So, what is a README.md file? This is the first thing that people see when they open your repository. It should have all the details about your project, what kind of project it is, what you've used to develop it, etc. There's no strict list for what your readme should have, but aim to have the following:",
      bullets: [
        'some images of your project',
        'a description of your project',
        'instructions on how to try your project out',
        "inspiration? Why'd you make your project?",
        "technologies you've used - you don't need to list everything!",
      ],
    },
    {
      q: 'Demo',
      a: "This really depends on what kind of project it is! Different projects get shipped differently, but you want other people to be able to experience your project as easily as possible. Here are some examples of what is and isn't okay.",
      nestedBullets: {
        'Static web apps/websites': [
          'Yes - You can deploy it on GitHub Pages, Vercel, Netlify, etc., so we can visit a URL to see it',
          "No - Don't give us a tunnel link (like ngrok or Cloudflare Tunnels), because it needs to be hosted somewhere permanently",
          'No - Do not put your GitHub repo as your Demo URL with instructions how to host it locally.',
        ],
        'Full-stack web apps (with databases/backend)': [
          'Yes - You can buy cloud hosting credits from the shop to cover hosting your backend!',
          "Yes - If there's an account system, demo accounts are allowed to make it easier for voters, but we should be able to create an account!",
          "No - Hosting on Railway or Render free tiers aren't accepted because there's no guarantee they'll host it indefinitely, and they can have very slow cold starts",
        ],
        Games: [
          'Yes - Your game has to be built and ready to play. Game should be hosted / put in GitHub releases or on platforms like itch.io!',
          "No - Do not make it in a way that we'd have to build it locally!",
        ],
        'Game mods': [
          'Yes - Publish your mods on platforms like - Modrinth or Curseforge!',
          'No - Avoid GitHub releases in this case',
          "No - Do not make it in a way that we'd had to build it ourselves!",
        ],
        'Bots (Discord, Slack, etc)': [
          'Yes - Host it so we can test it out! Provide a link to a testing channel or server as a demo link, and ensure each command is properly documented.',
          "No - Don't make us host it ourselves!",
        ],
        'Browser extensions': [
          'Yes - Ideally, publish it on the relevant store (e.g. addons.mozilla.org)',
          'Yes - Or, upload a one-click-install extension file (e.g. .crx) to GitHub Releases',
          "No - Don't provide a zip file that requires extra steps to be loaded!",
        ],
        Userscripts: [
          'Yes - Publish it to Tampermonkey or Greasyfork',
          "No - Don't give us a link to a txt file on GitHub",
        ],
        'Command line tools or packages': [
          'Yes - Publish it on the package index for your language. PyPi for Python, NPM for JavaScript/TypeScript, crates.io for Rust, etc...',
          "No - Don't make us download your repo locally, install dependencies and run a specific file!",
        ],
        APIs: [
          'Yes - Deploy it and provide an interface like Swagger where we can test each endpoint. Ensure your README is extra detailed!',
        ],
        'AI/ML projects': [
          "No - Uploading to Hugging Face isn't properly deploying it!",
        ],
        Esolangs: [
          'Yes - Ideally, provide a web-based playground',
          'Yes - Or, give detailed installation instructions and a syntax guide',
        ],
      },
    },
    {
      q: 'Demo for hardware projects',
      a: '',
      nestedBullets: {
        'Microcontroller firmware (without PCB design)': [
          'Yes - Provide a link to a hardware simulator like Wokwi',
        ],
        'Design-only hardware projects': [
          'Yes - Show us the completed PCB design or schematics',
          'Yes - You can also include firmware and case design!',
          "No - Don't give us a hardware simulator",
        ],
        'Physical/built hardware projects': [
          "Yes - Ideally, link to a short write-up with a bit about what your project is, how it works, and why it's cool! (No essays required) Include a video showing the project working.",
          'Yes - Or, linking to a video on its own is acceptable',
        ],
      },
    },
  ],
  Certification: [
    {
      q: 'Can I resubmit if rejected?',
      a: 'Absolutely! Just fix whatever we mentioned in the notes and send it back. We are here to help you succeed!',
    },
    {
      q: 'I got rejected for a broken demo link?',
      a: "There is many reason why your demo link could be rejected. Make sure it's working, and does not return any errors before resubmitting! \n Rejections by the System are semi-automated with real person supervision, but sometimes it can make mistakes:(",
    },
    {
      q: 'I got rejected for a broken readme link?',
      a: 'The most common rejection is a non-raw readme url. Make sure your add a raw readme link to your project settings, and that the url does not return 404 or any other errors before resubmitting!',
    },
    {
      q: 'I got rejected for a broken repo link?',
      a: "Make sure your repo is public and the URL leads to your source code! It cannot be linked to any files, nor Readme's.",
    },
    {
      q: 'Can I change links after I shipped?',
      a: 'No, once you ship, you cannot change the any of the project links. You will have to wait for it to be rejected (if links are broken/incorect) and resubmit your project.',
    },
    {
      q: 'What happens after certification?',
      a: "When Shipwrights are done inspecting your ship - it's time to show your project in action! When your project gets approved, your project goes to voting! Voting determines how many cookies you will get! And to boost your chances, make sure to make as many devlogs as you can! Devlogs help voters see your development journey, and don't forget to show some images from your work! Also, the banner you choose is going to be the first thing voters see, which is their first impression on your project, so choose something that really shows what you've made!",
    },
  ],
  'Need more help?': [
    {
      q: "Questions that aren't about ships?",
      a: "If you've got any questions that aren't related to ships or certifications, pop over into #flavortown-help and someone will happily help you out! Happy shipping!",
      link: {
        text: 'Ask in #flavortown-help',
        url: 'https://hackclub.enterprise.slack.com/archives/C099P9FQQ91',
      },
    },
    {
      q: 'Not sure how to ship your project?',
      a: "Of course, your project might not be any of those listed above! If you're not sure what would be best for your project, ask in #ask-the-shipwrights and we'll help you figure it out!",
      link: {
        text: 'Ask in #ask-the-shipwrights',
        url: 'https://hackclub.enterprise.slack.com/archives/C099P9FQQ91',
      },
    },
  ],
}
