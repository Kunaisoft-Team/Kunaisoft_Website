export function createStorytellingContent(content: string, title: string): string {
  const sections = [
    createNarrativeIntro(title),
    content,
    createChallengeSection(),
    createSolutionSection(),
    createSuccessStories(),
    createFutureOutlook()
  ];

  return sections.join('\n\n');
}

function createNarrativeIntro(title: string): string {
  return `
    <section class="prose prose-lg max-w-none mb-8">
      <p class="text-lg leading-relaxed text-gray-700">
        Picture a world where ${title.toLowerCase()} transforms the way we work and live. This isn't just a vision of the future - it's happening right now, and innovative organizations are leading the charge.
      </p>
    </section>`;
}

function createChallengeSection(): string {
  return `
    <section class="prose prose-lg max-w-none mb-8">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mb-6">The Challenge</h2>
      <div class="bg-white p-6 rounded-xl shadow-sm">
        <p class="text-gray-700">
          Organizations today face unprecedented challenges in staying competitive and efficient. The rapid pace of technological change, coupled with evolving market demands, creates a complex landscape that requires innovative solutions.
        </p>
      </div>
    </section>`;
}

function createSolutionSection(): string {
  return `
    <section class="prose prose-lg max-w-none mb-8">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mb-6">The Solution</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <h3 class="text-xl font-semibold text-[#1A1F2C] mb-4">Innovation</h3>
          <p class="text-gray-700">Embracing cutting-edge technologies and methodologies to drive transformation.</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow-sm">
          <h3 class="text-xl font-semibold text-[#1A1F2C] mb-4">Integration</h3>
          <p class="text-gray-700">Seamlessly combining various tools and approaches for optimal results.</p>
        </div>
      </div>
    </section>`;
}

function createSuccessStories(): string {
  return `
    <section class="prose prose-lg max-w-none mb-8">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mb-6">Success Stories</h2>
      <div class="bg-[#F8F9FB] p-8 rounded-xl">
        <p class="text-lg leading-relaxed text-gray-700">
          Leading organizations have already implemented these solutions, achieving remarkable results in efficiency, productivity, and innovation. Their experiences provide valuable insights and best practices for others looking to follow suit.
        </p>
      </div>
    </section>`;
}

function createFutureOutlook(): string {
  return `
    <section class="prose prose-lg max-w-none mb-8">
      <h2 class="text-3xl font-bold text-[#1A1F2C] mb-6">Looking Ahead</h2>
      <div class="space-y-4">
        <p class="text-gray-700">
          The future holds even more exciting possibilities as technology continues to evolve. Organizations that embrace these changes and adapt their strategies accordingly will be well-positioned for success in the years to come.
        </p>
      </div>
    </section>`;
}