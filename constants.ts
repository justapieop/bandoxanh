import { Station, WasteType, Post, NewsArticle, User, Comment, RecyclingEvent, Award } from './types';

export const STATIONS: Station[] = [
  {
    id: 1,
    name: 'Trạm Tái Chế Quận Hoàn Kiếm',
    address: '59 Hàng Bài, Phường Hàng Bài, Quận Hoàn Kiếm, Hà Nội',
    lat: 21.0227,
    lng: 105.8521,
    hours: '08:00 - 17:00',
    wasteTypes: [WasteType.Plastic, WasteType.Paper, WasteType.Metal],
    image: 'https://source.unsplash.com/400x300/?recycling,plastic,paper',
  },
  {
    id: 2,
    name: 'Điểm Thu Gom Rác Điện Tử Cầu Giấy',
    address: '144 Xuân Thủy, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội',
    lat: 21.0368,
    lng: 105.7825,
    hours: '09:00 - 16:00 (Thứ 7)',
    wasteTypes: [WasteType.Electronic, WasteType.Battery],
    image: 'https://source.unsplash.com/400x300/?e-waste,electronic-recycling',
  },
  {
    id: 3,
    name: 'Nhà máy xử lý rác hữu cơ Sóc Sơn',
    address: 'Khu liên hợp xử lý chất thải rắn Nam Sơn, Sóc Sơn, Hà Nội',
    lat: 21.2833,
    lng: 105.8000,
    hours: '24/7',
    wasteTypes: [WasteType.Organic],
    image: 'https://source.unsplash.com/400x300/?compost,organic-waste',
  },
  {
    id: 4,
    name: 'Trạm Xanh Ba Đình',
    address: '19C Ngọc Hà, Phường Ngọc Hà, Quận Ba Đình, Hà Nội',
    lat: 21.0375,
    lng: 105.8288,
    hours: '07:30 - 18:00',
    wasteTypes: [WasteType.Glass, WasteType.Paper, WasteType.Plastic],
    image: 'https://source.unsplash.com/400x300/?recycling-bins,glass,plastic',
  },
];

export const EVENTS: RecyclingEvent[] = [
  {
    id: 101,
    name: 'Ngày Hội Tái Chế Rác Thải Điện Tử',
    address: 'Cung Văn hóa Lao động Hữu nghị Việt Xô, 91 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
    lat: 21.0210,
    lng: 105.8450,
    date: '25/08/2024',
    time: '08:00 - 17:00',
    organizer: 'Việt Nam Tái Chế (WVR)',
    description: 'Mang rác thải điện tử cũ của bạn đến để được xử lý đúng cách và nhận những phần quà xanh. Cùng chung tay bảo vệ môi trường!',
    image: 'https://source.unsplash.com/400x300/?e-waste,event',
  },
  {
    id: 102,
    name: 'Đổi Vỏ Hộp Sữa Lấy Quà',
    address: 'AEON Mall Long Biên, 27 Đ. Cổ Linh, Long Biên, Hà Nội',
    lat: 21.0259,
    lng: 105.8997,
    date: 'Mỗi Thứ 7, Chủ Nhật',
    time: '09:00 - 21:00',
    organizer: 'Tetra Pak Việt Nam',
    description: 'Thu gom vỏ hộp sữa đã qua sử dụng để đổi lấy các sản phẩm tái chế hữu ích như sổ tay, tấm lợp sinh thái. Yêu cầu làm sạch và gấp gọn vỏ hộp.',
    image: 'https://source.unsplash.com/400x300/?milk,carton,recycling',
  },
];


export const AWARDS: Award[] = [
  { id: 1, name: 'Mầm Xanh', description: 'Thành viên mới tích cực, khởi đầu cho hành trình xanh.', icon: 'SproutIcon' },
  { id: 2, name: 'Nhà Vô Địch Tái Chế', description: 'Đóng góp xuất sắc trong việc tái chế và phân loại rác thải.', icon: 'MedalIcon' },
  { id: 3, name: 'Người Truyền Cảm Hứng', description: 'Tích cực chia sẻ kiến thức và lan tỏa lối sống bền vững đến cộng đồng.', icon: 'HeartHandshakeIcon' },
];


export const USERS: User[] = [
  {
    id: 1,
    name: 'An Nguyễn',
    avatar: 'https://picsum.photos/seed/avatar1/100/100',
    joinDate: '01/06/2024',
    bio: 'Yêu môi trường và thích tái chế. Cùng nhau hành động vì một hành tinh xanh!',
    awards: [AWARDS[0]],
    clerkId: 'user_mock_1',
    points: 120,
    level: 2,
    isAdmin: false,
    email: 'an.nguyen@example.com',
    title: 'Thành viên tích cực',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Bảo Trần',
    avatar: 'https://picsum.photos/seed/avatar2/100/100',
    joinDate: '15/05/2024',
    bio: 'Nhiếp ảnh gia và tình nguyện viên dọn dẹp bãi biển. Luôn tìm kiếm vẻ đẹp trong những điều giản dị.',
    awards: [AWARDS[0], AWARDS[2]],
    clerkId: 'user_mock_2',
    points: 350,
    level: 5,
    isAdmin: false,
    email: 'bao.tran@example.com',
    title: 'Người truyền lửa',
    createdAt: new Date('2024-05-15'),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: 'Minh Thư',
    avatar: 'https://picsum.photos/seed/avatar3/100/100',
    joinDate: '20/06/2024',
    bio: 'Sinh viên ngành môi trường. Thích làm đồ handmade từ vật liệu tái chế.',
    awards: [AWARDS[0], AWARDS[1], AWARDS[2]],
    clerkId: 'user_mock_3',
    points: 50,
    level: 1,
    isAdmin: false,
    email: 'minh.thu@example.com',
    title: 'Thành viên mới',
    createdAt: new Date('2024-06-20'),
    updatedAt: new Date(),
  },
];


export const POSTS: Post[] = [
  {
    id: 7,
    author: USERS[1],
    content: 'Mọi người ơi, cho mình hỏi thăm ý kiến. Để bảo vệ môi trường tốt hơn, mọi người nghĩ chúng ta nên tập trung vào hành động nào trước tiên?',
    poll: {
      question: 'Hành động nào bạn cho là ưu tiên nhất?',
      options: [
        { id: 1, text: 'Tái chế nhiều hơn', votes: 112 },
        { id: 2, text: 'Giảm sử dụng đồ nhựa 1 lần', votes: 189 },
        { id: 3, text: 'Tiết kiệm điện, nước', votes: 45 },
        { id: 4, text: 'Sử dụng phương tiện công cộng', votes: 23 },
      ],
    },
    timestamp: '1 ngày trước',
    likes: 250,
    comments: [
      { id: 9, author: USERS[0], content: 'Mình nghĩ giảm sử dụng đồ nhựa là gốc rễ của vấn đề.', timestamp: '1 ngày trước' },
      { id: 10, author: USERS[2], content: 'Đồng ý, giảm thiểu luôn tốt hơn là xử lý hậu quả.', timestamp: '20 giờ trước' },
    ]
  },
  {
    id: 1,
    author: USERS[0],
    content: 'Hôm nay mình vừa dọn dẹp và phân loại được một mớ chai nhựa. Cảm giác thật tuyệt vời khi góp phần bảo vệ môi trường!',
    images: ['https://picsum.photos/seed/post1/600/400'],
    timestamp: '2 giờ trước',
    likes: 128,
    comments: [
      { id: 1, author: USERS[1], content: 'Tuyệt vời quá bạn ơi!', timestamp: '1 giờ trước' },
      { id: 2, author: USERS[2], content: 'Hành động nhỏ, ý nghĩa lớn. Cảm ơn bạn đã chia sẻ.', timestamp: '30 phút trước' },
    ],
  },
  {
    id: 2,
    author: USERS[1],
    content: 'Tham gia sự kiện "Chủ Nhật Xanh" tại công viên gần nhà. Mọi người cùng chung tay làm sạch khu phố.',
    images: ['https://picsum.photos/seed/post2/600/400'],
    timestamp: 'Hôm qua',
    likes: 256,
    comments: [
      { id: 3, author: USERS[0], content: 'Sự kiện ý nghĩa quá! Tiếc là mình không tham gia được.', timestamp: '20 giờ trước' },
    ],
  },
  {
    id: 3,
    author: USERS[2],
    content: 'Vừa hoàn thành xong mấy chậu cây xinh xắn từ chai nhựa cũ. Tận dụng đồ cũ thích thật! Khoe thành quả với mọi người nè.',
    images: [
      'https://picsum.photos/seed/DIY1/600/600',
      'https://picsum.photos/seed/DIY2/600/600',
    ],
    timestamp: '3 ngày trước',
    likes: 310,
    comments: [
      { id: 4, author: USERS[0], content: 'Khéo tay quá bạn ơi!', timestamp: '2 ngày trước' },
    ],
  },
  {
    id: 4,
    author: USERS[0],
    content: 'Một buổi sáng cuối tuần đi dọn rác ở bãi biển. Buồn vì thấy nhiều rác quá, nhưng cũng vui vì được góp sức làm sạch môi trường.',
    images: [
      'https://picsum.photos/seed/cleanup1/600/400',
      'https://picsum.photos/seed/cleanup2/400/600',
      'https://picsum.photos/seed/cleanup3/600/400',
    ],
    timestamp: '4 ngày trước',
    likes: 450,
    comments: [
      { id: 5, author: USERS[1], content: 'Hoạt động tuyệt vời!', timestamp: '4 ngày trước' },
      { id: 6, author: USERS[2], content: 'Cảm ơn những đóng góp của bạn.', timestamp: '3 ngày trước' },
    ],
  },
  {
    id: 5,
    author: USERS[1],
    content: 'Bộ sưu tập "thời trang tái chế" của mình. Ai bảo đồ cũ là đồ bỏ đi nào?',
    images: [
      'https://picsum.photos/seed/fashion1/600/600',
      'https://picsum.photos/seed/fashion2/600/600',
      'https://picsum.photos/seed/fashion3/600/600',
      'https://picsum.photos/seed/fashion4/600/600',
    ],
    timestamp: '5 ngày trước',
    likes: 520,
    comments: [],
  },
  {
    id: 6,
    author: USERS[2],
    content: 'Cuộc sống "zero waste" không hề khó như mọi người nghĩ. Đây là góc bếp của mình, mình đã thay thế gần hết đồ nhựa dùng một lần rồi.',
    images: [
      'https://picsum.photos/seed/zero1/800/600',
      'https://picsum.photos/seed/zero2/600/800',
      'https://picsum.photos/seed/zero3/600/800',
      'https://picsum.photos/seed/zero4/800/600',
      'https://picsum.photos/seed/zero5/800/600',
    ],
    timestamp: '6 ngày trước',
    likes: 680,
    comments: [
      { id: 7, author: USERS[0], content: 'Ngưỡng mộ bạn quá!', timestamp: '5 ngày trước' },
      { id: 8, author: USERS[1], content: 'Truyền cảm hứng quá!', timestamp: '5 ngày trước' },
    ],
  },
];

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 1,
    title: 'Việt Nam đặt mục tiêu giảm 75% rác thải nhựa đại dương vào năm 2030',
    category: 'Chính sách',
    excerpt: 'Chính phủ đã phê duyệt kế hoạch hành động quốc gia về quản lý rác thải nhựa đại dương, với nhiều mục tiêu tham vọng.',
    imageUrl: 'https://picsum.photos/seed/news1/400/250',
    date: '10/07/2024',
    isFeatured: true,
    content: `Ngày 28 tháng 12 năm 2021, Thủ tướng Chính phủ đã ban hành Quyết định số 1746/QĐ-TTg về Kế hoạch hành động quốc gia về quản lý rác thải nhựa đại dương đến năm 2030. Kế hoạch này đặt ra những mục tiêu cụ thể và tham vọng nhằm giải quyết vấn nạn ô nhiễm nhựa đang ngày càng nghiêm trọng.
Mục tiêu tổng quát là thực hiện thành công các sáng kiến và cam kết của Việt Nam với quốc tế về việc giải quyết các vấn đề rác thải nhựa, đặc biệt là rác thải nhựa đại dương, phấn đấu đưa Việt Nam trở thành quốc gia tiên phong trong khu vực về giảm thiểu rác thải nhựa đại dương.
Các mục tiêu cụ thể bao gồm: Giảm 50% rác thải nhựa trên biển và đại dương vào năm 2025 và 75% vào năm 2030; 100% các khu du lịch, dịch vụ ven biển không sử dụng sản phẩm nhựa dùng một lần; 100% các khu bảo tồn biển không còn rác thải nhựa.`
  },
  {
    id: 2,
    title: 'Mô hình năng lượng mặt trời áp mái: Giải pháp cho các hộ gia đình',
    category: 'Năng lượng sạch',
    excerpt: 'Ngày càng nhiều gia đình lựa chọn lắp đặt pin năng lượng mặt trời để tiết kiệm chi phí và giảm phát thải carbon.',
    imageUrl: 'https://picsum.photos/seed/news2/400/250',
    date: '08/07/2024',
    content: `Điện mặt trời áp mái đang trở thành một xu hướng phổ biến tại các đô thị lớn ở Việt Nam. Đây là giải pháp năng lượng sạch không chỉ giúp các hộ gia đình tiết kiệm đáng kể chi phí tiền điện hàng tháng mà còn góp phần bảo vệ môi trường.
Hệ thống hoạt động bằng cách chuyển đổi quang năng từ ánh sáng mặt trời thành điện năng thông qua các tấm pin quang điện. Lượng điện dư thừa không sử dụng hết có thể được bán lại cho Tập đoàn Điện lực Việt Nam (EVN), mang lại một nguồn thu nhập thụ động.
Việc lắp đặt hệ thống này cũng giúp giảm tải cho lưới điện quốc gia, đặc biệt là trong những giờ cao điểm, và giảm hiệu ứng nhà kính, hướng tới một tương lai phát triển bền vững.`
  },
  {
    id: 3,
    title: 'Sự kiện "Ngày hội tái chế" thu hút hàng ngàn bạn trẻ tham gia',
    category: 'Sự kiện',
    excerpt: 'Sự kiện đã tạo ra một sân chơi bổ ích, nơi mọi người có thể đổi rác tái chế lấy quà và tìm hiểu thêm về lối sống xanh.',
    imageUrl: 'https://picsum.photos/seed/news3/400/250',
    date: '05/07/2024',
    content: `Sự kiện "Ngày hội tái chế" được tổ chức tại Nhà văn hóa Thanh niên TP.HCM đã thu hút sự tham gia của đông đảo các bạn trẻ và gia đình. Chương trình bao gồm nhiều hoạt động ý nghĩa như thu gom và đổi rác tái chế (chai nhựa, giấy, pin cũ) lấy các sản phẩm thân thiện với môi trường như túi vải, cây sen đá, sổ tay tái chế.
Bên cạnh đó, các gian hàng triển lãm về sản phẩm tái chế, các buổi workshop hướng dẫn làm đồ handmade từ vật liệu cũ cũng đã mang đến nhiều kiến thức bổ ích. Sự kiện không chỉ góp phần nâng cao nhận thức về việc phân loại và tái chế rác mà còn lan tỏa thông điệp sống xanh, sống có trách nhiệm trong cộng đồng.`
  },
  {
    id: 4,
    title: 'Hướng dẫn phân loại rác tại nguồn đúng cách',
    category: 'Hướng dẫn',
    excerpt: 'Phân loại rác tại nguồn là bước đầu tiên và quan trọng nhất trong quy trình quản lý và tái chế rác thải. Cùng tìm hiểu cách thực hiện nhé!',
    imageUrl: 'https://picsum.photos/seed/news4/400/250',
    date: '02/07/2024',
    content: `Phân loại rác tại nguồn giúp giảm lượng rác thải ra môi trường, tiết kiệm tài nguyên và chi phí xử lý. Về cơ bản, bạn có thể chia rác thải sinh hoạt thành 3 nhóm chính:
1. Rác hữu cơ: Bao gồm thức ăn thừa, vỏ rau củ quả, lá cây... Loại rác này có thể được dùng để ủ phân compost, tạo ra phân bón tự nhiên rất tốt cho cây trồng.
2. Rác tái chế: Gồm giấy, nhựa, kim loại, thủy tinh... Đây là những loại rác có thể được tái chế thành các sản phẩm mới. Hãy làm sạch chúng trước khi bỏ vào thùng rác riêng.
3. Rác còn lại: Bao gồm các loại rác không thể tái chế hoặc không phải rác hữu cơ như tã bỉm, băng vệ sinh, vỏ bao bì bánh kẹo, túi nilon bẩn...
Hãy trang bị các thùng rác riêng biệt cho từng loại để việc phân loại trở nên dễ dàng và hiệu quả hơn.`
  },
  {
    id: 5,
    title: 'Biến chai nhựa thành vật dụng hữu ích: 5 ý tưởng sáng tạo',
    category: 'Tái chế',
    excerpt: 'Đừng vội vứt đi những chai nhựa đã qua sử dụng. Với một chút khéo léo, bạn có thể biến chúng thành những vật dụng độc đáo và tiện lợi.',
    imageUrl: 'https://picsum.photos/seed/news5/400/250',
    date: '28/06/2024',
    content: `Tái chế chai nhựa không chỉ giúp bảo vệ môi trường mà còn là một hoạt động sáng tạo thú vị. Dưới đây là một vài ý tưởng bạn có thể thử:
1. Chậu cây tự tưới: Cắt đôi chai nhựa, lật ngược phần đầu chai có nắp (đã đục lỗ) và đặt vào phần thân chai. Bạn đã có một chậu cây thông minh có khả năng tự tưới.
2. Hộp đựng bút: Cắt phần thân dưới của chai nhựa và trang trí theo sở thích để tạo thành một chiếc hộp đựng bút xinh xắn.
3. Đồ chơi cho trẻ em: Chai nhựa có thể được biến thành ô tô, tên lửa, hoặc các con vật ngộ nghĩnh, kích thích sự sáng tạo của trẻ.
4. Hệ thống tưới nhỏ giọt: Đục các lỗ nhỏ trên thân chai, đổ đầy nước và cắm ngược xuống gốc cây để tạo hệ thống tưới nhỏ giọt tiết kiệm nước.
5. Đèn trang trí: Kết hợp chai nhựa với đèn LED dây để tạo ra những chiếc đèn lồng độc đáo cho khu vườn hoặc ban công của bạn.`
  },
];

export const ENV_QUOTES = [
  "Trái đất không phải là của chúng ta, chúng ta mượn nó từ con cháu chúng ta.",
  "Hãy sống xanh hôm nay vì một ngày mai tươi sáng.",
  "Mỗi hành động nhỏ đều góp phần tạo nên sự thay đổi lớn.",
  "Rác thải là tài nguyên chưa được đặt đúng chỗ.",
  "Bảo vệ môi trường là bảo vệ chính cuộc sống của chúng ta.",
  "Không có loại rác nào là vô dụng, chỉ có cách xử lý chưa phù hợp.",
  "Thiên nhiên không cần chúng ta, chúng ta cần thiên nhiên.",
  "Hãy giảm thiểu, tái sử dụng và tái chế bất cứ khi nào có thể.",
  "Một cái cây hôm nay, một khu rừng ngày mai.",
  "Sống xanh không khó, cái khó là bạn có muốn bắt đầu hay không."
];