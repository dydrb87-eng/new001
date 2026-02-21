# **App Name**: 도서관 좌석 매니저

## Core Features:

- 좌석 현황 디스플레이: 도서관 내 1번부터 20번까지의 좌석 번호를 시각적으로 표시하며, 각 번호는 고유 ID를 가진 클릭 가능한 링크로 제공합니다.
- 입실/퇴실 처리: 사용자가 좌석 링크를 클릭할 때마다 입실 또는 퇴실 상태를 자동으로 토글하고, 해당 작업 시점의 정확한 시간을 기록합니다.
- 사용자 상태 알림: 좌석 링크 클릭 시 '입실하였습니다' 또는 '퇴실하였습니다' 메시지와 함께 현재 시간을 즉시 사용자에게 표시하여 상태 변화를 명확히 안내합니다.
- 좌석 이용 기록 저장: 각 좌석의 모든 입실 및 퇴실 이벤트를 타임스탬프와 함께 데이터베이스에 지속적으로 저장하여 추후 조회를 가능하게 합니다.
- 관리자 이용 이력 조회: 관리자가 특정 좌석의 링크에 접속하면 해당 좌석의 과거 모든 입실/퇴실 기록과 총 누적 사용 시간을 확인할 수 있는 관리 도구를 제공합니다.

## Style Guidelines:

- Primary color: Muted, deep blue (#264D73). This color is selected to convey a sense of calm, focus, and intellectual environment, aligning with the concept of a library. It offers a sophisticated and readable contrast against a light background.
- Background color: Soft, cool grey (#ECEFF2). Derived from the primary hue, this very light and desaturated background creates a clean, spacious, and eye-friendly canvas, crucial for an application where clarity of information is paramount.
- Accent color: Vibrant sky blue (#2EB2D1). As an analogous color, this brighter and more saturated blue provides a clear visual signal for interactive elements such as seat links and status updates, enhancing user interaction and engagement without being overwhelming.
- Primary font: 'Inter' (sans-serif) for all text elements. Chosen for its high legibility, modern neutrality, and versatility across different contexts, ensuring that seat numbers, messages, and timestamps are clear and accessible to all users.
- Seat Grid Display: The main interface will feature a simple, intuitive grid layout to display the 20 numbered seats. This arrangement ensures easy scanning and quick navigation for users to select their desired seat.
- Subtle State Change Feedback: Minimal and smooth animations, such as a quick pulse or a gentle color shift, will be used when a user successfully checks in or out of a seat. This provides clear, non-disruptive feedback on interactions.