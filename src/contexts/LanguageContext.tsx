import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations = {
  vi: {
  // Admin
  'admin.gallery.title': 'Quản lý Hình ảnh',
  'admin.gallery.upload': 'Tải lên hình ảnh',
  'admin.gallery.uploading': 'Đang tải lên...',
  'admin.gallery.delete': 'Xóa',
    'admin.login': 'Đăng nhập Admin',
    'admin.dashboard': 'Quản trị Website',
    'admin.logout': 'Đăng xuất',
    'admin.manage_reflections': 'Quản lý Phúc Âm',
    'admin.manage_events': 'Quản lý Sự kiện',
    'admin.manage_gallery': 'Quản lý Hình ảnh',
  // Navigation
  'nav.home': 'Trang chủ',
  'nav.about': 'Giới thiệu',
  'nav.ministries': 'Ban Ngành',
  'nav.events': 'Sự kiện',
  'nav.gallery': 'Hình ảnh',
  'nav.reflections': 'Phúc Âm',
  'nav.give': 'Ủng Hộ',
  'nav.contact': 'Liên hệ',
  // Gallery
  'gallery.title': 'Thư Viện Hình Ảnh',
  'gallery.subtitle': 'Xem lại những khoảnh khắc đẹp và hoạt động của cộng đoàn qua các hình ảnh được cập nhật thường xuyên.',
  'gallery.empty': 'Chưa có hình ảnh nào được đăng tải.',
    
    // Homepage
    'home.title': 'Cộng Đoàn Công Giáo Việt Nam St. Timothy',
    'home.subtitle': 'Chào mừng quý vị đến với cộng đoàn nhỏ bé của chúng tôi tại Melbourne!',
    'home.description': 'Mục tiêu của cộng đoàn là sống theo tinh thần Tin Mừng trong đoàn kết, yêu thương và phục vụ.',
    'home.mass_time': 'Thánh Lễ mỗi Chúa Nhật lúc 5 giờ chiều tại 17 Stevens Rd, Vermont VIC 3133.',
    'home.learn_more': 'Tìm hiểu thêm',
    'home.contact_us': 'Liên hệ với chúng tôi',
    
    // Common
    'common.read_more': 'Đọc thêm',
    'common.view_all': 'Xem tất cả',
    'common.contact': 'Liên hệ',
    'common.phone': 'Điện thoại',
    'common.email': 'Email',
    'common.address': 'Địa chỉ',
    
    // Events
    'events.title': 'Sự Kiện Cộng Đoàn',
    'events.subtitle': 'Theo dõi và tham gia các sự kiện sắp tới của cộng đoàn. Cùng nhau xây dựng một cộng đoàn gắn kết và phát triển.',
    'events.upcoming': 'Sắp diễn ra',
    'events.past': 'Đã diễn ra',
    'events.all': 'Tất cả sự kiện',
    'events.next_event': 'Sự Kiện Sắp Diễn Ra',
    'events.latest_event': 'Sự kiện gần nhất',
    'events.no_upcoming': 'Không có sự kiện sắp tới.',
    'events.no_events': 'Chưa có sự kiện nào được tạo.',
    
    // Reflections
    'reflections.title': 'Phúc Âm & Suy Niệm',
    'reflections.subtitle': 'Chia sẻ lời Chúa và những suy niệm tâm linh để nuôi dưỡng đời sống đức tin. Cùng nhau lắng nghe và sống theo lời Thiên Chúa.',
    'reflections.search': 'Tìm kiếm',
    'reflections.search_placeholder': 'Tìm theo tiêu đề hoặc nội dung...',
    'reflections.author': 'Tác giả',
    'reflections.all_authors': 'Tất cả tác giả',
    'reflections.sort': 'Sắp xếp',
    'reflections.newest': 'Mới nhất',
    'reflections.oldest': 'Cũ nhất',
    'reflections.by_title': 'Theo tiêu đề',
    'reflections.showing': 'Hiển thị',
    'reflections.of': '/',
    'reflections.reflections': 'bài suy niệm',
    'reflections.no_results': 'Không tìm thấy kết quả',
    'reflections.no_results_desc': 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.',
    'reflections.clear_filters': 'Xóa bộ lọc',
    'reflections.no_reflections': 'Chưa có bài suy niệm nào',
    'reflections.no_reflections_desc': 'Các bài suy niệm và chia sẻ Phúc Âm sẽ được cập nhật thường xuyên.',
    'reflections.gospel': 'Phúc Âm',
    'reflections.read_more': 'Đọc thêm →',
    'reflections.recently': 'Gần đây',
    'reflections.back_to_list': 'Quay lại danh sách',
    'reflections.edit_admin': 'Chỉnh sửa (Admin)',
    
    // Give
    'give.title': 'Ủng Hộ Cộng Đoàn',
    'give.subtitle': 'Cảm ơn lòng hảo tâm của quý vị. Sự đóng góp của quý vị giúp cộng đoàn duy trì các hoạt động tôn giáo và phục vụ cộng đồng.',
    'give.bank_transfer': 'Chuyển khoản ngân hàng',
    'give.cash_donation': 'Ủng hộ trực tiếp',
    'give.bank_transfer_title': 'Chuyển khoản ngân hàng',
    'give.cash_donation_title': 'Ủng hộ trực tiếp',
    'give.account_name': 'Tên tài khoản:',
    'give.bsb': 'BSB:',
    'give.account_number': 'Số tài khoản:',
    'give.reference': 'Ghi chú:',
    'give.reference_note': 'Tên của quý vị + "Ung ho CGVN St Timothy"',
    'give.cash_description': 'Quý vị có thể ủng hộ trực tiếp bằng tiền mặt trong các dịp:',
    'give.sunday_mass': 'Trong Thánh Lễ Chủ Nhật',
    'give.special_occasions': 'Các dịp lễ đặc biệt',
    'give.meet_committee': 'Gặp trực tiếp Ban Chấp hành',
    'give.contact_title': 'Liên hệ',
    'give.contact_description': 'Nếu quý vị cần hỗ trợ hoặc có câu hỏi về việc ủng hộ, vui lòng liên hệ Ban Chấp hành qua số điện thoại',
    
    // About
    'about.title': 'Giới thiệu về Cộng Đoàn Công Giáo Việt Nam St. Timothy',
    'about.welcome': 'Chào mừng quý vị và các bạn đến với trang điện tử của Cộng Đoàn Công Giáo Việt Nam St. Timothy (CĐCGVNST). Cũng như Thánh Timothy ít mấy ai biết đến, CĐCGVNST cũng chẳng mấy ai nghe tên. Là một cộng đoàn nhỏ bé (khoảng hơn 120 tín hữu), nhưng cộng đoàn có Thánh Lễ mỗi Chúa Nhật vào lúc 5 giờ chiều tại nhà thờ St. Timothy.',
    'about.history_title': 'Lịch Sử Hình Thành',
    'about.history_p1': 'Cộng đoàn được thành lập vào năm 2013, bắt đầu từ một nhóm nhỏ các gia đình Công Giáo Việt Nam sinh sống tại khu vực Vermont và vùng phụ cận. Với sự chấp thuận của Tổng Giáo Phận Melbourne, cộng đoàn đã được phép tổ chức Thánh Lễ tiếng Việt tại nhà thờ St. Timothy.',
    'about.history_p2': 'Qua thời gian, cộng đoàn đã phát triển từ vài chục người ban đầu lên đến hơn 120 tín hữu hiện nay. Điều đáng mừng là số lượng các gia đình trẻ và thiếu nhi trong cộng đoàn ngày càng tăng, mang đến sinh khí mới cho cộng đoàn.',
    'about.mission_vision': 'Sứ Mệnh & Tầm Nhìn',
    'about.mission': 'Sứ Mệnh',
    'about.vision': 'Tầm Nhìn',
    'about.mission_1': 'Duy trì và phát triển đức tin Công Giáo trong cộng đồng người Việt',
    'about.mission_2': 'Giáo dục đức tin cho thế hệ trẻ',
    'about.mission_3': 'Phục vụ cộng đồng và lan tỏa tình yêu của Chúa',
    'about.vision_1': 'Xây dựng một cộng đoàn vững mạnh trong đức tin',
    'about.vision_2': 'Kết nối các thế hệ trong cộng đồng Công Giáo Việt Nam',
    'about.vision_3': 'Là điểm tựa tinh thần cho người Công Giáo Việt Nam xa xứ',
    'about.activities_title': 'Sinh Hoạt Cộng Đoàn',
    'about.liturgy': 'Phụng Vụ',
    'about.education': 'Giáo Dục Đức Tin',
    'about.community': 'Hoạt Động Cộng Đồng',
    'about.liturgy_1': 'Thánh Lễ Chúa Nhật hàng tuần',
    'about.liturgy_2': 'Các nghi thức phụng vụ đặc biệt',
    'about.liturgy_3': 'Thánh ca và đọc sách thánh',
    'about.education_1': 'Lớp giáo lý cho thiếu nhi',
    'about.education_2': 'Sinh hoạt giới trẻ',
    'about.education_3': 'Học hỏi Kinh Thánh',
    'about.community_1': 'Thăm viếng người già và bệnh nhân',
    'about.community_2': 'Các hoạt động từ thiện xã hội',
    'about.community_3': 'Tổ chức các sự kiện cộng đồng',
    'about.leadership': 'Ban Mục Vụ',
    'about.leadership_desc': 'Ban Mục Vụ hiện tại của cộng đoàn gồm các thành viên nhiệt thành, tận tụy phục vụ dưới sự hướng dẫn của cha Tuyên Úy. Các thành viên Ban Mục Vụ luôn sẵn sàng lắng nghe và phục vụ nhu cầu của anh chị em giáo dân trong cộng đoàn.',
    'about.join_title': 'Tham Gia Cùng Chúng Tôi',
    'about.join_desc': 'Cộng đoàn luôn rộng mở chào đón các anh chị em mới. Nếu bạn muốn tìm hiểu thêm hoặc tham gia các hoạt động của cộng đoàn, xin đừng ngần ngại liên hệ với chúng tôi.',
    'about.call': 'Gọi Điện',
    'about.email': 'Gửi Email',
    
    // Contact
    'contact.title': 'Liên hệ',
    'contact.description': 'Nếu bạn có câu hỏi hoặc cần hỗ trợ, hãy liên hệ với chúng tôi qua các thông tin dưới đây hoặc đến tham dự Thánh Lễ vào Chủ Nhật hàng tuần.',
    'contact.address': 'Địa chỉ:',
    'contact.address_value': '17 Stevens Road, Vermont VIC 3133, Australia',
    'contact.mass': 'Thánh Lễ:',
    'contact.mass_time': 'Chủ Nhật 5:00pm - 6:00pm',
    'contact.phone': 'Điện thoại:',
    'contact.email': 'Email:',
    'contact.facebook': 'Facebook:',
    
    // Ministries
    'ministries.title': 'Mục Vụ',
    'ministries.description': 'Cộng đoàn Thánh Timothy có nhiều ban mục vụ khác nhau phục vụ nhu cầu tâm linh và đời sống của giáo dân.',
    'ministries.youth': 'Mục Vụ Gia Đình',
    'ministries.youth_desc': 'Tổ chức các hoạt động cho gia đình và trẻ em trong cộng đoàn.',
    'ministries.liturgy': 'Mục Vụ Phụng Vụ',
    'ministries.liturgy_desc': 'Chuẩn bị và phục vụ trong các thánh lễ và nghi thức tôn giáo.',
    'ministries.music': 'Ca Đoàn',
    'ministries.music_desc': 'Phục vụ âm nhạc trong thánh lễ và các dịp lễ đặc biệt.',
    'ministries.charity': 'Mục Vụ Từ Thiện',
    'ministries.charity_desc': 'Hỗ trợ những người có hoàn cảnh khó khăn trong cộng đoàn và xã hội.',
    
    // Homepage additional sections
    'home.welcome_title': 'Chào Mừng Đến Với Cộng Đoàn',
    'home.faith_title': 'Đức Tin',
    'home.faith_desc': 'Cùng nhau thờ phượng và tăng trưởng trong đức tin Công Giáo',
    'home.community_title': 'Cộng Đồng',
    'home.community_desc': 'Xây dựng mối quan hệ thân thiết trong cộng đoàn người Việt',
    'home.service_title': 'Phục Vụ',
    'home.service_desc': 'Cùng nhau phục vụ và lan tỏa tình yêu của Chúa',
    'home.mass_schedule_title': 'Giờ Lễ & Địa Điểm',
    'home.mass_schedule_subtitle': 'Lịch Thánh Lễ',
    'home.sunday': 'Chúa Nhật:',
    'home.sunday_time': '5:00 PM',
    'home.special_days': 'Các ngày lễ trọng:',
    'home.special_days_desc': 'Theo thông báo',
    'home.confession': 'Xưng tội:',
    'home.confession_time': 'Trước Thánh Lễ 30 phút',
    'home.info_title': 'Thông Tin',
    'home.address_label': 'Địa chỉ:',
    'home.address_value': '17 Stevens Rd, Vermont VIC 3133',
    'home.parking_label': 'Bãi đậu xe:',
    'home.parking_desc': 'Có chỗ đậu xe miễn phí trong khuôn viên nhà thờ',
    'home.contact_label': 'Liên hệ:',
    'home.upcoming_events': 'Sự Kiện Sắp Tới',
    'home.important_event': 'Sự kiện quan trọng sắp diễn ra',
    'home.other_events': 'Các sự kiện sắp tới khác',
    'home.details': 'Chi tiết',
    'home.view_all_events': 'Xem tất cả sự kiện',
    'home.ministries_title': 'Mục Vụ',
    'home.children_ministry': 'Thiếu Nhi',
    'home.children_desc': 'Giáo lý và sinh hoạt cho các em nhỏ',
    'home.youth_ministry': 'Giới Trẻ',
    'home.youth_desc': 'Hoạt động và chia sẻ cho người trẻ',
    'home.family_ministry': 'Gia Đình',
    'home.family_desc': 'Đồng hành cùng các gia đình trẻ',
    'home.choir_ministry': 'Ca Đoàn',
    'home.choir_desc': 'Phục vụ thánh ca trong Thánh Lễ',
    'home.latest_content': 'Phúc Âm Mới',
    'home.gospel': 'Phúc Âm',
    'home.read_more': 'Đọc tiếp',
    'home.view_all_gospel': 'Xem tất cả bài Phúc Âm',
    'home.connect': 'Kết Nối',
    'home.follow_us': 'Theo dõi chúng tôi',
    'home.facebook': 'Facebook',
    'home.email': 'Email',
    'home.contact_direct': 'Liên hệ trực tiếp',
    'home.join_us_title': 'Tham Gia Cùng Chúng Tôi',
    'home.join_us_desc': 'Chúng tôi luôn chào đón thành viên mới tham gia vào cộng đoàn. Hãy đến dự Thánh Lễ và tham gia các hoạt động của cộng đoàn!',
    'home.contact_now': 'Liên Hệ Ngay',
    'home.learn_more_about': 'Tìm Hiểu Thêm',
    
    // Footer
    'footer.copyright': 'Cộng Đoàn Công Giáo Việt Nam St. Timothy. Đã đăng ký bản quyền.',
    'footer.about': 'Giới thiệu',
    'footer.contact': 'Liên hệ',
  },
  en: {
  // Admin
  'admin.gallery.title': 'Manage Gallery',
  'admin.gallery.upload': 'Upload Image',
  'admin.gallery.uploading': 'Uploading...',
  'admin.gallery.delete': 'Delete',
    'admin.login': 'Admin Login',
    'admin.dashboard': 'Website Admin',
    'admin.logout': 'Logout',
    'admin.manage_reflections': 'Manage Gospel',
    'admin.manage_events': 'Manage Events',
    'admin.manage_gallery': 'Manage Gallery',
  // Navigation
  'nav.home': 'Home',
  'nav.about': 'About',
  'nav.ministries': 'Ministries',
  'nav.events': 'Events',
  'nav.gallery': 'Gallery',
  'nav.reflections': 'Gospel',
  'nav.give': 'Give',
  'nav.contact': 'Contact',
  // Gallery
  'gallery.title': 'Image Gallery',
  'gallery.subtitle': 'Browse beautiful moments and community activities through regularly updated images.',
  'gallery.empty': 'No images have been uploaded yet.',
    
    // Homepage
    'home.title': 'Vietnamese Catholic Community St. Timothy',
    'home.subtitle': 'Welcome to our small community in Melbourne!',
    'home.description': 'Our goal is to live according to the Gospel spirit in unity, love and service.',
    'home.mass_time': 'Sunday Mass at 5:00 PM at 17 Stevens Rd, Vermont VIC 3133.',
    'home.learn_more': 'Learn More',
    'home.contact_us': 'Contact Us',
    
    // Common
    'common.read_more': 'Read More',
    'common.view_all': 'View All',
    'common.contact': 'Contact',
    'common.phone': 'Phone',
    'common.email': 'Email',
    'common.address': 'Address',
    
    // Events
    'events.title': 'Community Events',
    'events.subtitle': 'Follow and participate in upcoming community events. Together we build a connected and thriving community.',
    'events.upcoming': 'Upcoming',
    'events.past': 'Past',
    'events.all': 'All Events',
    'events.next_event': 'Upcoming Events',
    'events.latest_event': 'Next event',
    'events.no_upcoming': 'No upcoming events.',
    'events.no_events': 'No events have been created yet.',
    
    // Reflections
    'reflections.title': 'Gospel & Reflections',
    'reflections.subtitle': 'Share God\'s word and spiritual reflections to nourish faith life. Together we listen and live according to God\'s word.',
    'reflections.search': 'Search',
    'reflections.search_placeholder': 'Search by title or content...',
    'reflections.author': 'Author',
    'reflections.all_authors': 'All authors',
    'reflections.sort': 'Sort',
    'reflections.newest': 'Newest',
    'reflections.oldest': 'Oldest',
    'reflections.by_title': 'By Title',
    'reflections.showing': 'Showing',
    'reflections.of': '/',
    'reflections.reflections': 'reflections',
    'reflections.no_results': 'No results found',
    'reflections.no_results_desc': 'Try changing your search keywords or filters.',
    'reflections.clear_filters': 'Clear filters',
    'reflections.no_reflections': 'No reflections yet',
    'reflections.no_reflections_desc': 'Gospel reflections and shares will be updated regularly.',
    'reflections.gospel': 'Gospel',
    'reflections.read_more': 'Read more →',
    'reflections.recently': 'Recently',
    'reflections.back_to_list': 'Back to list',
    'reflections.edit_admin': 'Edit (Admin)',
    
    // Give
    'give.title': 'Support Our Community',
    'give.subtitle': 'Thank you for your generosity. Your contributions help our community maintain religious activities and serve the community.',
    'give.bank_transfer': 'Bank Transfer',
    'give.cash_donation': 'Direct Donation',
    'give.bank_transfer_title': 'Bank Transfer',
    'give.cash_donation_title': 'Direct Donation',
    'give.account_name': 'Account Name:',
    'give.bsb': 'BSB:',
    'give.account_number': 'Account Number:',
    'give.reference': 'Reference:',
    'give.reference_note': 'Your name + "Donation CGVN St Timothy"',
    'give.cash_description': 'You can donate directly with cash on the following occasions:',
    'give.sunday_mass': 'During Sunday Mass',
    'give.special_occasions': 'Special feast days',
    'give.meet_committee': 'Meet directly with the Committee',
    'give.contact_title': 'Contact',
    'give.contact_description': 'If you need assistance or have questions about donations, please contact the Committee at',
    
    // About
    'about.title': 'About Vietnamese Catholic Community St. Timothy',
    'about.welcome': 'Welcome to the website of the Vietnamese Catholic Community St. Timothy (VCCST). Like Saint Timothy who few people know about, VCCST is also not widely known. We are a small community (about 120+ faithful), but we have Sunday Mass every week at 5:00 PM at St. Timothy Church.',
    'about.history_title': 'Formation History',
    'about.history_p1': 'The community was established in 2013, starting from a small group of Vietnamese Catholic families living in the Vermont area and surrounding regions. With the approval of the Archdiocese of Melbourne, the community was permitted to organize Vietnamese Mass at St. Timothy Church.',
    'about.history_p2': 'Over time, the community has grown from a few dozen people initially to over 120 faithful today. What is encouraging is that the number of young families and children in the community is increasing, bringing new vitality to the community.',
    'about.mission_vision': 'Mission & Vision',
    'about.mission': 'Mission',
    'about.vision': 'Vision',
    'about.mission_1': 'Maintain and develop Catholic faith in the Vietnamese community',
    'about.mission_2': 'Educate faith for the younger generation',
    'about.mission_3': 'Serve the community and spread God\'s love',
    'about.vision_1': 'Build a strong community in faith',
    'about.vision_2': 'Connect generations in the Vietnamese Catholic community',
    'about.vision_3': 'Be a spiritual support for Vietnamese Catholics abroad',
    'about.activities_title': 'Community Activities',
    'about.liturgy': 'Liturgy',
    'about.education': 'Faith Education',
    'about.community': 'Community Activities',
    'about.liturgy_1': 'Weekly Sunday Mass',
    'about.liturgy_2': 'Special liturgical ceremonies',
    'about.liturgy_3': 'Sacred music and scripture reading',
    'about.education_1': 'Catechism classes for children',
    'about.education_2': 'Youth activities',
    'about.education_3': 'Bible study',
    'about.community_1': 'Visiting elderly and sick people',
    'about.community_2': 'Social charity activities',
    'about.community_3': 'Organizing community events',
    'about.leadership': 'Pastoral Committee',
    'about.leadership_desc': 'The current Pastoral Committee of the community consists of dedicated members who serve devotedly under the guidance of the Chaplain. The Pastoral Committee members are always ready to listen and serve the needs of the faithful in the community.',
    'about.join_title': 'Join Us',
    'about.join_desc': 'The community always welcomes new members. If you want to learn more or participate in community activities, please do not hesitate to contact us.',
    'about.call': 'Call',
    'about.email': 'Send Email',
    
    // Contact
    'contact.title': 'Contact',
    'contact.description': 'If you have questions or need support, please contact us through the information below or attend Sunday Mass weekly.',
    'contact.address': 'Address:',
    'contact.address_value': '17 Stevens Road, Vermont VIC 3133, Australia',
    'contact.mass': 'Mass:',
    'contact.mass_time': 'Sunday 5:00pm - 6:00pm',
    'contact.phone': 'Phone:',
    'contact.email': 'Email:',
    'contact.facebook': 'Facebook:',
    
    // Ministries
    'ministries.title': 'Ministries',
    'ministries.description': 'St. Timothy Community has various ministries serving the spiritual and life needs of the faithful.',
    'ministries.youth': 'Family Ministry',
    'ministries.youth_desc': 'Organizing activities for families and children in the community.',
    'ministries.liturgy': 'Liturgical Ministry',
    'ministries.liturgy_desc': 'Preparing and serving in masses and religious ceremonies.',
    'ministries.music': 'Choir',
    'ministries.music_desc': 'Serving music in masses and special occasions.',
    'ministries.charity': 'Charity Ministry',
    'ministries.charity_desc': 'Supporting those in difficult circumstances in the community and society.',
    
    // Homepage additional sections
    'home.welcome_title': 'Welcome to Our Community',
    'home.faith_title': 'Faith',
    'home.faith_desc': 'Growing together in worship and Catholic faith',
    'home.community_title': 'Community',
    'home.community_desc': 'Building close relationships within the Vietnamese community',
    'home.service_title': 'Service',
    'home.service_desc': 'Serving together and spreading God\'s love',
    'home.mass_schedule_title': 'Mass Times & Location',
    'home.mass_schedule_subtitle': 'Mass Schedule',
    'home.sunday': 'Sunday:',
    'home.sunday_time': '5:00 PM',
    'home.special_days': 'Special feast days:',
    'home.special_days_desc': 'As announced',
    'home.confession': 'Confession:',
    'home.confession_time': '30 minutes before Mass',
    'home.info_title': 'Information',
    'home.address_label': 'Address:',
    'home.address_value': '17 Stevens Rd, Vermont VIC 3133',
    'home.parking_label': 'Parking:',
    'home.parking_desc': 'Free parking available on church grounds',
    'home.contact_label': 'Contact:',
    'home.upcoming_events': 'Upcoming Events',
    'home.important_event': 'Important upcoming event',
    'home.other_events': 'Other upcoming events',
    'home.details': 'Details',
    'home.view_all_events': 'View all events',
    'home.ministries_title': 'Ministries',
    'home.children_ministry': 'Children',
    'home.children_desc': 'Catechism and activities for children',
    'home.youth_ministry': 'Youth',
    'home.youth_desc': 'Activities and sharing for young people',
    'home.family_ministry': 'Family',
    'home.family_desc': 'Accompanying young families',
    'home.choir_ministry': 'Choir',
    'home.choir_desc': 'Serving sacred music in Mass',
    'home.latest_content': 'Latest Gospel',
    'home.gospel': 'Gospel',
    'home.read_more': 'Read more',
    'home.view_all_gospel': 'View all Gospel reflections',
    'home.connect': 'Connect',
    'home.follow_us': 'Follow us',
    'home.facebook': 'Facebook',
    'home.email': 'Email',
    'home.contact_direct': 'Contact directly',
    'home.join_us_title': 'Join Us',
    'home.join_us_desc': 'We always welcome new members to join our community. Come attend Mass and participate in community activities!',
    'home.contact_now': 'Contact Now',
    'home.learn_more_about': 'Learn More',
    
    // Footer
    'footer.copyright': 'Vietnamese Catholic Community St. Timothy. All rights reserved.',
    'footer.about': 'About',
    'footer.contact': 'Contact',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'vi' || saved === 'en') return saved;
    return 'vi';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
/* eslint-disable react-refresh/only-export-components */
