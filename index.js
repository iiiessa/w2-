require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  AttachmentBuilder
} = require('discord.js');

const {
  createCanvas,
  loadImage
} = require('canvas');

const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const TOKEN = process.env.DISCORD_TOKEN;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;

if (!TOKEN || !WELCOME_CHANNEL_ID) {
  console.error(
    'Missing DISCORD_TOKEN or WELCOME_CHANNEL_ID environment variable.'
  );
  process.exit(1);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
  try {

    // ==============================
    // قناة الترحيب
    // ==============================

    const channel = await member.guild.channels.fetch(
      WELCOME_CHANNEL_ID
    );

    if (!channel || !channel.isTextBased()) {
      return;
    }

    // ==============================
    // تحميل تصميم الترحيب
    // ==============================

    const templatePath = path.join(
      __dirname,
      'assets',
      'welcome-template.png'
    );

    const base = await loadImage(templatePath);

    // ==============================
    // إنشاء الصورة
    // ==============================

    const canvas = createCanvas(
      base.width,
      base.height
    );

    const ctx = canvas.getContext('2d');

    // ==============================
    // مكان صورة العضو
    // ==============================

    // إذا احتجت تحريك الصورة لاحقًا
    // عدّل هذه الأرقام فقط

    const x = 1050;
    const y = 520;
    const radius = 180;

    // ==============================
    // صورة العضو
    // ==============================

    const avatarUrl =
      member.user.displayAvatarURL({
        extension: 'png',
        size: 512,
        forceStatic: true
      });

    const avatar = await loadImage(avatarUrl);

    // ==============================
    // رسم صورة العضو داخل دائرة
    // ==============================

    ctx.save();

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );

    ctx.closePath();

    ctx.clip();

    const size = radius * 2;

    const scale = Math.max(
      size / avatar.width,
      size / avatar.height
    );

    const width = avatar.width * scale;
    const height = avatar.height * scale;

    ctx.drawImage(
      avatar,
      x - width / 2,
      y - height / 2,
      width,
      height
    );

    ctx.restore();

    // ==============================
    // وضع التصميم فوق صورة العضو
    // ==============================

    ctx.drawImage(
      base,
      0,
      0
    );

    // ==============================
    // النص
    // ==============================

    // النص الإنجليزي
    ctx.save();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 40px Arial';

    ctx.fillStyle = '#ffffff';

    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillText(
      'WELCOME TO OUR SERVER',
      500,
      500
    );

    ctx.restore();

    // ==============================
    // النص العربي
    // ==============================

    ctx.save();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = 'bold 58px Arial';

    ctx.fillStyle = '#ffffff';

    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillText(
      'أهلاً وسهلاً',
      500,
      430
    );

    ctx.restore();

    // ==============================
    // تجهيز الملف
    // ==============================

    const attachment = new AttachmentBuilder(
      canvas.toBuffer('image/png'),
      {
        name: 'welcome.png'
      }
    );

    // ==============================
    // إرسال الترحيب
    // ==============================

    await channel.send({
      content: member.toString(),
      files: [attachment]
    });

  } catch (error) {

    console.error(
      'Welcome message error:',
      error
    );

  }
});

// ==============================
// تشغيل البوت
// ==============================

client.login(TOKEN);