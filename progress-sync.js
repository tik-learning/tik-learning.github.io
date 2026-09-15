```javascript
/* =========================================================
   TIK LEARNING
   PROGRESS SYNC
   SISTEM TIMER + PENYIMPANAN NILAI KUIS EXCEL

   FUNGSI:
   1. Tidak membuat input nama tambahan
   2. Tidak menimpa startQuiz() asli
   3. Mengambil nama dari #participantInput
   4. Mengambil kelas dari #classInput
   5. Timer 15 menit
   6. Menyimpan hasil ke localStorage
   7. Mengirim hasil ke Google Spreadsheet
   8. Menyimpan tanggal dan waktu selesai
   9. Menambahkan tombol Perkembangan
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       PENGATURAN
       ===================================================== */

    const NILAI_LULUS = 75;

    // Waktu kuis = 15 menit
    const WAKTU_KUIS = 15 * 60;


    /*
       URL GOOGLE APPS SCRIPT
    */

    const GOOGLE_SCRIPT_URL =
        "https://script.google.com/macros/s/AKfcyby2QLtU-w0rhDuJFxlrNbEHSWDHeVP8JVD0s4sGPNDKNMDRMvn_uHsd4bzlUndjtb9G/exec";


    /* =====================================================
       MENENTUKAN NOMOR MODUL
       ===================================================== */

    const namaFile =
        window.location.pathname;


    const hasilMatch =
        namaFile.match(
            /kuis-excel-(\d+)/i
        );


    /*
       Jika halaman bukan kuis Excel,
       hentikan script.
    */

    if (!hasilMatch) {

        return;

    }


    const nomorModul =
        Number(
            hasilMatch[1]
        );


    const storageKey =
        "kuisExcel" + nomorModul;


    /* =====================================================
       VARIABEL
       ===================================================== */

    let namaPeserta = "";

    let kelasPeserta = "";

    let timerInterval = null;

    let waktuTersisa =
        WAKTU_KUIS;

    let timerSudahDimulai =
        false;

    let hasilSudahDisimpan =
        false;

    let hasilSudahDikirim =
        false;


    /* =====================================================
       MENGAMBIL DATA PESERTA
       ===================================================== */

    function ambilDataPeserta() {

        /*
           Nama diambil dari form HTML asli.
        */

        const inputNama =
            document.getElementById(
                "participantInput"
            );


        /*
           Kelas diambil dari form HTML asli.
        */

        const inputKelas =
            document.getElementById(
                "classInput"
            );


        if (inputNama) {

            namaPeserta =
                inputNama.value.trim();

        }


        if (inputKelas) {

            kelasPeserta =
                inputKelas.value.trim();

        }


        /*
           Jika input sudah tidak ada
           karena overlay sudah ditutup,
           ambil dari sessionStorage/localStorage.
        */

        if (!namaPeserta) {

            namaPeserta =
                sessionStorage.getItem(
                    "namaPeserta"
                ) ||
                localStorage.getItem(
                    "namaPeserta"
                ) ||
                "";

        }


        if (!kelasPeserta) {

            kelasPeserta =
                sessionStorage.getItem(
                    "kelasPeserta"
                ) ||
                localStorage.getItem(
                    "kelasPeserta"
                ) ||
                "";

        }


        /*
           Simpan kembali.
        */

        if (namaPeserta) {

            sessionStorage.setItem(
                "namaPeserta",
                namaPeserta
            );

            localStorage.setItem(
                "namaPeserta",
                namaPeserta
            );

        }


        if (kelasPeserta) {

            sessionStorage.setItem(
                "kelasPeserta",
                kelasPeserta
            );

            localStorage.setItem(
                "kelasPeserta",
                kelasPeserta
            );

        }

    }


    /* =====================================================
       MEMBUAT TIMER
       ===================================================== */

    function buatTimer() {

        /*
           Jangan membuat timer dua kali.
        */

        if (
            document.getElementById(
                "quizTimer"
            )
        ) {

            return;

        }


        const timer =
            document.createElement(
                "div"
            );


        timer.id =
            "quizTimer";


        timer.innerHTML = `

            <div class="ps-timer">

                ⏱️ Sisa Waktu:

                <strong id="quizTimerText">
                    15:00
                </strong>

            </div>

        `;


        /*
           Cari tempat timer.
        */

        const tempatTimer =

            document.getElementById(
                "quizCard"
            )

            ||

            document.getElementById(
                "quizSection"
            )

            ||

            document.querySelector(
                ".quiz-container"
            )

            ||

            document.querySelector(
                ".quiz"
            );


        if (tempatTimer) {

            tempatTimer.insertBefore(
                timer,
                tempatTimer.firstChild
            );

        }

    }


    /* =====================================================
       UPDATE TIMER
       ===================================================== */

    function updateTimer() {

        const timerText =
            document.getElementById(
                "quizTimerText"
            );


        if (!timerText) {

            return;

        }


        const menit =
            Math.floor(
                waktuTersisa / 60
            );


        const detik =
            waktuTersisa % 60;


        timerText.textContent =

            String(menit).padStart(
                2,
                "0"
            )

            +

            ":"

            +

            String(detik).padStart(
                2,
                "0"
            );


        /*
           Peringatan 1 menit terakhir.
        */

        const timerBox =
            timerText.closest(
                ".ps-timer"
            );


        if (
            waktuTersisa <= 60 &&
            timerBox
        ) {

            timerBox.classList.add(
                "danger"
            );

        }

    }


    /* =====================================================
       MULAI TIMER
       ===================================================== */

    function mulaiTimer() {

        if (timerSudahDimulai) {

            return;

        }


        timerSudahDimulai =
            true;


        /*
           Ambil data peserta
           sebelum overlay hilang.
        */

        ambilDataPeserta();


        buatTimer();

        updateTimer();


        timerInterval =
            setInterval(
                function () {

                    waktuTersisa--;


                    updateTimer();


                    /*
                       Waktu habis.
                    */

                    if (
                        waktuTersisa <= 0
                    ) {

                        clearInterval(
                            timerInterval
                        );

                        timerInterval =
                            null;


                        alert(
                            "⏰ Waktu kuis telah habis. " +
                            "Jawaban akan dikumpulkan otomatis."
                        );


                        /*
                           Jalankan finishQuiz asli.
                        */

                        if (
                            typeof window.finishQuiz ===
                            "function"
                        ) {

                            window.finishQuiz();

                        }

                    }

                },
                1000
            );

    }


    /* =====================================================
       MENCARI NILAI
       ===================================================== */

    function ambilNilai() {

        const kemungkinanID = [

            "score",
            "nilai",
            "finalScore",
            "scoreValue",
            "hasilNilai"

        ];


        for (
            let i = 0;
            i < kemungkinanID.length;
            i++
        ) {

            const element =
                document.getElementById(
                    kemungkinanID[i]
                );


            if (!element) {

                continue;

            }


            const teks =
                element.textContent || "";


            const angka =
                Number(
                    teks.replace(
                        /[^\d.-]/g,
                        ""
                    )
                );


            if (!isNaN(angka)) {

                return angka;

            }

        }


        return 0;

    }


    /* =====================================================
       MENCARI JUMLAH BENAR
       ===================================================== */

    function ambilBenar() {

        const ids = [

            "correctCount",
            "benar",
            "jumlahBenar"

        ];


        for (
            let i = 0;
            i < ids.length;
            i++
        ) {

            const element =
                document.getElementById(
                    ids[i]
                );


            if (!element) {

                continue;

            }


            const teks =
                element.textContent || "";


            const angka =
                Number(
                    teks.replace(
                        /[^\d.-]/g,
                        ""
                    )
                );


            if (!isNaN(angka)) {

                return angka;

            }

        }


        return 0;

    }


    /* =====================================================
       MENCARI JUMLAH SALAH
       ===================================================== */

    function ambilSalah() {

        const ids = [

            "wrongCount",
            "salah",
            "jumlahSalah"

        ];


        for (
            let i = 0;
            i < ids.length;
            i++
        ) {

            const element =
                document.getElementById(
                    ids[i]
                );


            if (!element) {

                continue;

            }


            const teks =
                element.textContent || "";


            const angka =
                Number(
                    teks.replace(
                        /[^\d.-]/g,
                        ""
                    )
                );


            if (!isNaN(angka)) {

                return angka;

            }

        }


        return 0;

    }


    /* =====================================================
       MENGHITUNG JUMLAH SOAL
       ===================================================== */

    function ambilJumlahSoal() {

        /*
           Untuk kuis Excel saat ini
           jumlah soal = 20.
        */

        const kemungkinanID = [

            "totalQuestions",
            "questionCount",
            "jumlahSoal"

        ];


        for (
            let i = 0;
            i < kemungkinanID.length;
            i++
        ) {

            const element =
                document.getElementById(
                    kemungkinanID[i]
                );


            if (!element) {

                continue;

            }


            const angka =
                Number(
                    element.textContent
                        .replace(
                            /[^\d.-]/g,
                            ""
                        )
                );


            if (
                !isNaN(angka) &&
                angka > 0
            ) {

                return angka;

            }

        }


        /*
           Default Modul Excel = 20 soal.
        */

        return 20;

    }


    /* =====================================================
       MENGAMBIL WAKTU PENGERJAAN
       ===================================================== */

    function ambilWaktu() {

        /*
           Waktu yang digunakan =
           waktu awal - waktu tersisa.
        */

        const waktuDigunakan =
            WAKTU_KUIS -
            Math.max(
                0,
                waktuTersisa
            );


        const menit =
            Math.floor(
                waktuDigunakan / 60
            );


        const detik =
            waktuDigunakan % 60;


        return (

            String(menit).padStart(
                2,
                "0"
            )

            +

            ":"

            +

            String(detik).padStart(
                2,
                "0"
            )

        );

    }


    /* =====================================================
       MENGIRIM HASIL KE GOOGLE SPREADSHEET
       ===================================================== */

    function kirimKeGoogleSheet() {

        /*
           Jangan kirim dua kali.
        */

        if (hasilSudahDikirim) {

            return;

        }


        /*
           Ambil data peserta terbaru.
        */

        ambilDataPeserta();


        if (!namaPeserta) {

            namaPeserta =
                "Peserta";

        }


        const nilai =
            ambilNilai();


        const benar =
            ambilBenar();


        const salah =
            ambilSalah();


        const jumlahSoal =
            ambilJumlahSoal();


        /*
           Status kelulusan.
        */

        const status =

            nilai >= NILAI_LULUS

                ? "LULUS"

                : "BELUM LULUS";


        /*
           Tanggal dan waktu selesai.
        */

        const tanggal =
            new Date()
                .toLocaleString(
                    "id-ID"
                );


        /*
           Waktu pengerjaan.
        */

        const waktu =
            ambilWaktu();


        /*
           Data yang dikirim ke Apps Script.

           Nama field dibuat sesuai
           sistem Spreadsheet kuis:
           
           jenis
           nama
           kelas
           modul
           jumlahSoal
           benar
           nilai
           waktu
           tanggal
           status
        */

        const data = {

            jenis:
                "kuis",

            nama:
                namaPeserta,

            kelas:
                kelasPeserta,

            modul:
                "Modul " +
                nomorModul +
                " - Formula Dasar Microsoft Excel",

            jumlahSoal:
                jumlahSoal,

            benar:
                benar,

            nilai:
                nilai,

            waktu:
                waktu,

            tanggal:
                tanggal,

            status:
                status

        };


        /*
           Kirim menggunakan POST.
        */

        fetch(
            GOOGLE_SCRIPT_URL,
            {

                method:
                    "POST",

                mode:
                    "no-cors",

                headers:
                    {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                body:
                    JSON.stringify(
                        data
                    )

            }
        )
        .then(
            function () {

                hasilSudahDikirim =
                    true;

                console.log(
                    "✓ Hasil kuis berhasil dikirim ke Google Spreadsheet."
                );

            }
        )
        .catch(
            function (error) {

                console.error(
                    "✗ Gagal mengirim hasil kuis:",
                    error
                );

            }
        );

    }


    /* =====================================================
       MENYIMPAN HASIL SECARA LOKAL
       ===================================================== */

    function simpanHasil() {

        /*
           Jangan simpan dua kali.
        */

        if (hasilSudahDisimpan) {

            /*
               Walaupun sudah tersimpan lokal,
               tetap pastikan pengiriman ke Google.
            */

            kirimKeGoogleSheet();

            return;

        }


        /*
           Ambil data peserta.
        */

        ambilDataPeserta();


        if (!namaPeserta) {

            namaPeserta =
                "Peserta";

        }


        const nilai =
            ambilNilai();


        const benar =
            ambilBenar();


        const salah =
            ambilSalah();


        const status =

            nilai >= NILAI_LULUS

                ? "LULUS"

                : "BELUM LULUS";


        const tanggal =
            new Date()
                .toLocaleString(
                    "id-ID"
                );


        const dataKuis = {

            modul:
                nomorModul,

            nama:
                namaPeserta,

            kelas:
                kelasPeserta,

            nilai:
                nilai,

            benar:
                benar,

            salah:
                salah,

            selesai:
                true,

            status:
                status,

            tanggal:
                tanggal

        };


        /*
           Simpan ke localStorage.
        */

        localStorage.setItem(

            storageKey,

            JSON.stringify(
                dataKuis
            )

        );


        /*
           Simpan nama dan kelas.
        */

        localStorage.setItem(
            "namaPeserta",
            namaPeserta
        );


        if (kelasPeserta) {

            localStorage.setItem(
                "kelasPeserta",
                kelasPeserta
            );

        }


        sessionStorage.setItem(
            "namaPeserta",
            namaPeserta
        );


        if (kelasPeserta) {

            sessionStorage.setItem(
                "kelasPeserta",
                kelasPeserta
            );

        }


        hasilSudahDisimpan =
            true;


        /*
           Hentikan timer.
        */

        if (timerInterval) {

            clearInterval(
                timerInterval
            );

            timerInterval =
                null;

        }


        /*
           Kirim ke Google Spreadsheet.
        */

        kirimKeGoogleSheet();


        /*
           Tambahkan tombol perkembangan.
        */

        tambahTombolPerkembangan();

    }


    /* =====================================================
       TOMBOL PERKEMBANGAN
       ===================================================== */

    function tambahTombolPerkembangan() {

        if (
            document.getElementById(
                "progressLink"
            )
        ) {

            return;

        }


        const hasil =

            document.getElementById(
                "result"
            )

            ||

            document.getElementById(
                "resultSection"
            )

            ||

            document.querySelector(
                ".result"
            );


        if (!hasil) {

            return;

        }


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.id =
            "progressLink";


        wrapper.style.marginTop =
            "20px";


        wrapper.innerHTML = `

            <a
                href="perkembangan.html"
                class="ps-progress-button"
            >
                📊 Lihat Perkembangan
            </a>

        `;


        hasil.appendChild(
            wrapper
        );

    }


    /* =====================================================
       MEMANTAU MULAI KUIS
       ===================================================== */

    function pantauMulaiKuis() {

        const overlay =
            document.getElementById(
                "passwordOverlay"
            );


        if (!overlay) {

            return;

        }


        /*
           Observer memantau perubahan
           overlay dari tampil menjadi tersembunyi.
        */

        const observer =
            new MutationObserver(
                function () {

                    const style =
                        window.getComputedStyle(
                            overlay
                        );


                    /*
                       Jika overlay hilang,
                       berarti kuis sudah dimulai.
                    */

                    if (

                        style.display ===
                        "none"

                        ||

                        style.visibility ===
                        "hidden"

                        ||

                        overlay.style.display ===
                        "none"

                    ) {

                        if (
                            !timerSudahDimulai
                        ) {

                            mulaiTimer();

                        }

                    }

                }
            );


        observer.observe(

            overlay,

            {

                attributes:
                    true,

                attributeFilter:
                    [
                        "style",
                        "class"
                    ]

            }

        );

    }


    /* =====================================================
       MEMANTAU HASIL KUIS
       ===================================================== */

    function pantauHasil() {

        const intervalHasil =
            setInterval(
                function () {

                    const hasil =
                        document.getElementById(
                            "result"
                        );


                    if (!hasil) {

                        return;

                    }


                    const style =
                        window.getComputedStyle(
                            hasil
                        );


                    /*
                       Jika hasil sudah terlihat,
                       simpan dan kirim.
                    */

                    if (

                        style.display !==
                        "none"

                        &&

                        hasil.textContent
                            .trim() !==
                            ""

                    ) {

                        simpanHasil();


                        /*
                           Setelah berhasil
                           terdeteksi, tidak perlu
                           mengecek terus.
                        */

                        clearInterval(
                            intervalHasil
                        );

                    }

                },
                500
            );

    }


    /* =====================================================
       MEMANTAU TOMBOL SELESAI
       ===================================================== */

    function pantauTombolSelesai() {

        document.addEventListener(

            "click",

            function (event) {

                const target =
                    event.target;


                if (!target) {

                    return;

                }


                const tombol =
                    target.closest(
                        "button"
                    );


                if (!tombol) {

                    return;

                }


                const teks =

                    (
                        tombol.textContent ||
                        ""
                    )
                    .toLowerCase();


                /*
                   Deteksi tombol selesai.
                */

                if (

                    teks.includes(
                        "selesai"
                    )

                    ||

                    teks.includes(
                        "kumpulkan"
                    )

                    ||

                    teks.includes(
                        "submit"
                    )

                    ||

                    teks.includes(
                        "lihat hasil"
                    )

                ) {

                    /*
                       Beri waktu kepada
                       fungsi asli untuk
                       menghitung nilai.
                    */

                    setTimeout(

                        function () {

                            simpanHasil();

                        },

                        700

                    );

                }

            }

        );

    }


    /* =====================================================
       CSS
       ===================================================== */

    const style =
        document.createElement(
            "style"
        );


    style.textContent = `

        /* =========================
           TIMER
           ========================= */

        #quizTimer {

            width: 100%;

        }


        .ps-timer {

            margin-bottom: 18px;

            padding:
                13px 16px;

            border-radius: 10px;

            background:
                #eaf7ef;

            color:
                #107c41;

            text-align: center;

            font-weight: 600;

            font-size: 16px;

            box-shadow:
                0 2px 7px
                rgba(
                    0,
                    0,
                    0,
                    0.06
                );

        }


        .ps-timer strong {

            margin-left: 5px;

            font-size: 19px;

        }


        .ps-timer.danger {

            background:
                #fff0f0;

            color:
                #d32f2f;

        }


        /* =========================
           TOMBOL PERKEMBANGAN
           ========================= */

        .ps-progress-button {

            display: inline-block;

            text-decoration: none;

            background:
                #0788c9;

            color:
                #ffffff;

            padding:
                11px 17px;

            border-radius: 8px;

            font-weight: 700;

            font-size: 14px;

        }


        .ps-progress-button:hover {

            background:
                #056d9f;

        }

    `;


    document.head.appendChild(
        style
    );


    /* =====================================================
       INISIALISASI
       ===================================================== */

    function inisialisasi() {

        /*
           PENTING:

           Tidak ada lagi:

           buatFormNama()

           dan tidak ada:

           window.startQuiz = ...

           sehingga form nama dari HTML
           tidak akan dibuat dua kali.
        */

        pantauMulaiKuis();


        /*
           Pantau bagian hasil.
        */

        pantauHasil();


        /*
           Pantau tombol selesai.
        */

        pantauTombolSelesai();

    }


    /* =====================================================
       JALANKAN SCRIPT
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            inisialisasi
        );

    } else {

        inisialisasi();

    }


})();
```
