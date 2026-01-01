import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function decodeHtmlEntities(text: string): string {
    return text
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)));
}

async function main() {
    console.log('Reading local stations.html...');
    try {
        const fs = require('fs');
        const path = require('path');
        const htmlPath = path.join(__dirname, '../stations.html');

        if (!fs.existsSync(htmlPath)) {
            throw new Error(`File not found: ${htmlPath}. Please run curl to download it first.`);
        }
        const html = fs.readFileSync(htmlPath, 'utf-8');

        console.log(`Read ${html.length} bytes.`);

        console.log('Parsing stations...');

        // Debug: check text around 'station-marker'
        const debugIdx = html.indexOf('station-marker');
        if (debugIdx !== -1) {
            console.log('First occurrence context:');
            console.log(html.substring(debugIdx - 50, debugIdx + 150));
        } else {
            console.log('String "station-marker" NOT FOUND in html!');
        }

        // Try a simpler split approach
        // Split by <i 
        const parts = html.split('<i ');
        let count = 0;

        for (const part of parts) {
            if (part.includes('station-marker') && part.includes('data-lat')) {
                // This part belongs to a station marker tag
                // It ends with </i>
                const tagContent = part.split('</i>')[0];

                const latMatch = /data-lat="([^"]+)"/.exec(tagContent);
                const lngMatch = /data-lng="([^"]+)"/.exec(tagContent);
                const nameAttrMatch = /data-name="([^"]+)"/.exec(tagContent);

                if (latMatch && lngMatch && nameAttrMatch) {
                    // ... same logic ...
                    const lat = parseFloat(latMatch[1]);
                    const lng = parseFloat(lngMatch[1]);
                    let nameHtml = nameAttrMatch[1];

                    nameHtml = decodeHtmlEntities(nameHtml);

                    const nameContentMatch = /<div class='marker-title'>(.*?)<\/div>/.exec(nameHtml);
                    const addressContentMatch = /<\/div><div>(.*?)<\/div>/.exec(nameHtml);

                    let rawName = nameContentMatch ? nameContentMatch[1] : 'Unknown Station';
                    let rawAddress = addressContentMatch ? addressContentMatch[1] : '';

                    const name = decodeHtmlEntities(rawName);
                    const address = decodeHtmlEntities(rawAddress);

                    console.log(`Processing: [${name}] - ${address}`);

                    // Only create/update if valid
                    if (name && !isNaN(lat) && !isNaN(lng)) {
                        const existing = await prisma.bikeRental.findFirst({
                            where: { name: name }
                        });

                        const bikeData = {
                            name,
                            address,
                            latitude: lat,
                            longitude: lng,
                            price: '10.000đ / 60 phút',
                            hours: '05:00 - 24:00',
                            instructions: 'Tải ứng dụng TNGo (App Store / Google Play) để thuê xe. Quét mã QR trên khóa xe để mở.',
                            terms: 'Người dùng chịu trách nhiệm bảo quản xe trong quá trình thuê. Trả xe đúng trạm quy định.',
                            image: 'https://tngo.vn/Data/logo-vn.jpg',
                            isSponsored: false
                        };

                        if (existing) {
                            await prisma.bikeRental.update({
                                where: { id: existing.id },
                                data: bikeData
                            });
                        } else {
                            await prisma.bikeRental.create({
                                data: bikeData
                            });
                        }
                        count++;
                    }
                }
            }
        }
        console.log(`Successfully processed ${count} stations.`);
    } catch (error) {
        console.error("Error processing stations:", error);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
