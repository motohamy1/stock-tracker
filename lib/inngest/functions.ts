import { inngest } from "@/lib/inngest/client";
import { PERSONALIZED_WELCOME_EMAIL_PROMPT, NEWS_SUMMARY_EMAIL_PROMPT } from "@/lib/inngest/prompts";

import { sendWelcomeEmail, sendNewsSummaryEmail } from "../nodemailer";
import { getAllUsersForNewsEmail } from "../actions/user.actions";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.actions";
import { getNews } from "../actions/finnhub.actions";

export const sendSignUpEmail = inngest.createFunction(
    { id: 'sign-up-email' },
    { event: 'app/user.created' },
    async ({ event, step }) => {
        const userProfile = `
            -Country: ${event.data.country}
            -Investment goals: ${event.data.investmentGoals}
            -Risk tolerance: ${event.data.riskTolerance}
            -Preferred industry: ${event.data.preferredIndustry}
        `

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile)

        const response = await step.ai.infer('Generate personalized welcome email', {
            model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
            body: {
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: prompt }
                        ]
                    }]
            }
        })

        await step.run('send-welcome-email', async () => {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) || 'Thanks for joining stockjar tracker. You now have the the field and tools to track the markets and make smart investments'

            const { data: { email, name } } = event;

            return await sendWelcomeEmail({ email, name, intro: introText });
        })
        return {
            success: true,
            message: 'Welcome email sent successfully'
        }

    }
)

export const sendDailyNewsSummary = inngest.createFunction(
    { id: 'send-daily-news-summary' },
    [{ event: 'app/send.daily.news' }, { cron: '* 12 * * *' }],
    async ({ step }) => {
        // Step 1: Get all users
        const users = await step.run('get-all-users', async () => {
            console.log('[Inngest] Starting to get all users...');

            try {
                const result = await getAllUsersForNewsEmail();
                console.log(`[Inngest] Got ${result.length} users from database`);

                // If no users found, return test user for now
                if (result.length === 0) {
                    console.log('[Inngest] No users in database, using test user');
                    return [{
                        id: 'test-123',
                        email: 'test@example.com',
                        name: 'Test User',
                        country: 'US'
                    }];
                }

                return result;
            } catch (error) {
                console.error('[Inngest] Database error, using test user:', error);
                return [{
                    id: 'test-123',
                    email: 'test@example.com',
                    name: 'Test User',
                    country: 'US'
                }];
            }
        });

        console.log(`[Inngest] Users result:`, users);

        if (!users || users.length === 0) {
            console.log('[Inngest] No users found, returning early');
            return { success: false, message: "No users found for news email" };
        }

        console.log(`[Inngest] Processing ${users.length} users for news emails`);

        // Step 2: For each user, get their watchlist symbols and fetch news
        for (const user of users) {
            await step.run(`process-user-${user.id}`, async () => {
                try {
                    console.log(`[Inngest] Processing user: ${user.email}`);

                    // Get user's watchlist symbols
                    console.log(`[Inngest] Getting watchlist symbols for ${user.email}`);
                    const symbols = await getWatchlistSymbolsByEmail(user.email);
                    console.log(`[Inngest] Found ${symbols.length} symbols for ${user.email}:`, symbols);

                    // Fetch news (general if no symbols, or symbol-specific)
                    console.log(`[Inngest] Fetching news for ${user.email}...`);
                    const news = await getNews(symbols.length > 0 ? symbols : undefined);
                    console.log(`[Inngest] Found ${news.length} news articles for ${user.email}`);

                    if (news.length === 0) {
                        console.log(`[Inngest] No news found for user ${user.email}`);
                        return { skipped: true, reason: 'No news found' };
                    }

                    // Step 3: Summarize news via AI
                    console.log(`[Inngest] Generating AI summary for ${user.email}...`);
                    const newsData = JSON.stringify(news, null, 2);
                    const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', newsData);

                    const aiResponse = await step.ai.infer(`Generate news summary for ${user.email}`, {
                        model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
                        body: {
                            contents: [
                                {
                                    role: 'user',
                                    parts: [
                                        { text: prompt }
                                    ]
                                }
                            ]
                        }
                    });

                    const part = aiResponse.candidates?.[0]?.content?.parts?.[0];
                    const newsContent = (part && 'text' in part ? part.text : null) ||
                        `<p class="mobile-text dark-text-secondary" style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #CCDADC;">We found ${news.length} relevant news articles for you today, but couldn't generate a summary at this time. Please check back later!</p>`;

                    console.log(`[Inngest] Generated AI news summary for user ${user.email} with ${news.length} articles`);

                    // Step 4: Send the emails
                    console.log(`[Inngest] Sending email to ${user.email}...`);
                    const currentDate = new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    await sendNewsSummaryEmail({
                        email: user.email,
                        date: currentDate,
                        newsContent: newsContent
                    });

                    console.log(`[Inngest] Successfully sent news summary email to ${user.email}`);
                    return { success: true, email: user.email };

                } catch (error) {
                    console.error(`[Inngest] Failed to process news for user ${user.email}:`, error);
                    return { success: false, email: user.email, error: error instanceof Error ? error.message : 'Unknown error' };
                }
            });
        }

        return { success: true, message: 'Daily news summary emails sent successfully' };
    }
)