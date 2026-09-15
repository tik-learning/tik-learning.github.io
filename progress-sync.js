```javascript
/* =========================================================
   TIK LEARNING
   PROGRESS SYNC
   SISTEM TIMER + PENYIMPANAN NILAI KUIS EXCEL

   PERBAIKAN:
   1. TIDAK membuat form nama peserta tambahan.
   2. TIDAK mengganti / menimpa startQuiz() asli.
   3. Mengambil nama dari #participantInput.
   4. Mengambil kelas dari #classInput.
   5. Timer 15 menit.
   6. Menyimpan hasil kuis ke localStorage.
   7. Menyimpan tanggal dan waktu selesai.
   8. Menambahkan tombol "Lihat Perkembangan".
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       PENGATURAN
       ===================================================== */

    const NILAI_LULUS = 75;

    // 15 menit
    const WAKTU_KUIS = 15 * 60;


    /* =====================================================
       MENENTUKAN NOMOR MODUL OTOMATIS
       
       Contoh:
       kuis-excel-1.html  → Modul 1
       kuis-excel-2.html  → Modul 2
       ...
       kuis-excel-11.html → Modul 11
       ===================================================== */

    const namaFile = window.location.pathname;

    const hasilMatch =
        namaFile.match(/kuis-excel-(\d+)/i);


    /*
       Jika halaman bukan halaman kuis Excel,
       hentikan script.
    */

    if (!hasilMatch) {
        return;
    }


    const nomorModul =
        Number(hasilMatch[1]);


    const storageKey =
        "kuisExcel" + nomorModul;


    /* =====================================================
       VARIABEL
       ===================================================== */

    let namaPeserta = "";

    let kelasPeserta = "";

    let timerInterval = null;

    let waktuTersisa = WAKTU_KUIS;

    let timerSudahDimulai = false;

    let hasilSudahDisimpan = false;


    /* =====================================================
       MENGAMBIL DATA PESERTA
       ===================================================== */

    function ambilDataPeserta() {

        /*
           Nama peserta diambil dari input
           yang SUDAH ADA di HTML kuis.
        */

        const inputNama =
            document.getElementById(
                "participantInput"
            );


        /*
           Kelas peserta diambil dari input
           yang SUDAH ADA di HTML kuis.
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
           Jika tidak ditemukan,
           coba ambil dari penyimpanan browser.
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
           Simpan kembali agar dapat digunakan
           saat hasil kuis disimpan.
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


        /*
           Jika ditemukan,
           timer diletakkan di bagian paling atas.
        */

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
           Jika waktu tinggal 1 menit
           atau kurang, ubah menjadi merah.
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

        /*
           Jangan mulai timer dua kali.
        */

        if (timerSudahDimulai) {

            return;

        }


        timerSudahDimulai = true;


        /*
           Ambil data peserta.
        */

        ambilDataPeserta();


        /*
           Buat timer.
        */

        buatTimer();


        /*
           Tampilkan waktu awal.
        */

        updateTimer();


        /*
           Jalankan hitungan mundur.
        */

        timerInterval =
            setInterval(
                function () {

                    waktuTersisa--;


                    updateTimer();


                    /*
                       Jika waktu habis.
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
                           Jalankan fungsi finishQuiz
                           milik halaman kuis.
                        */

                        if (
                            typeof window.finishQuiz ===
                            "function"
                        ) {

                            /*
                               Simpan referensi fungsi asli
                               sebelum dipanggil.
                            */

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


            /*
               Hilangkan semua karakter
               selain angka, titik dan minus.
            */

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
       MENYIMPAN HASIL KUIS
       ===================================================== */

    function simpanHasil() {

        /*
           Jangan menyimpan dua kali.
        */

        if (hasilSudahDisimpan) {

            return;

        }


        /*
           Ambil data peserta terbaru.
        */

        ambilDataPeserta();


        /*
           Jika nama kosong,
           gunakan "Peserta".
        */

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


        /*
           Tentukan status kelulusan.
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
           Data yang disimpan.
        */

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
           Simpan berdasarkan nomor modul.

           Modul 1  → kuisExcel1
           Modul 2  → kuisExcel2
           Modul 3  → kuisExcel3
           dst.
        */

        localStorage.setItem(

            storageKey,

            JSON.stringify(
                dataKuis
            )

        );


        /*
           Simpan nama dan kelas secara global.
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


        /*
           Simpan juga ke sessionStorage.
        */

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


        hasilSudahDisimpan = true;


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
           Tambahkan tombol perkembangan.
        */

        tambahTombolPerkembangan();

    }


    /* =====================================================
       TOMBOL PERKEMBANGAN
       ===================================================== */

    function tambahTombolPerkembangan() {

        /*
           Jangan dibuat dua kali.
        */

        if (
            document.getElementById(
                "progressLink"
            )
        ) {

            return;

        }


        /*
           Cari bagian hasil.
        */

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


        /*
           Buat pembungkus tombol.
        */

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
       MENGAWASI START QUIZ ASLI
       =====================================================

       PENTING:

       Kita TIDAK mengganti window.startQuiz.

       startQuiz() tetap milik HTML kuis.

       Kita hanya mendeteksi ketika overlay
       password sudah ditutup dan kuis mulai.
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
           Observer akan mendeteksi perubahan
           display pada overlay.
        */

        const observer =
            new MutationObserver(
                function () {

                    const style =
                        window.getComputedStyle(
                            overlay
                        );


                    /*
                       Jika overlay sudah tidak terlihat,
                       berarti kuis sudah dimulai.
                    */

                    if (
                        style.display === "none" ||
                        style.visibility === "hidden" ||
                        overlay.style.display === "none"
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
                attributes: true,
                attributeFilter: [
                    "style",
                    "class"
                ]
            }
        );

    }


    /* =====================================================
       MENGAWASI HASIL KUIS
       ===================================================== */

    function pantauHasil() {

        /*
           Cek setiap 500 ms apakah
           bagian hasil sudah tampil.
        */

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
                       simpan hasil.
                    */

                    if (
                        style.display !== "none" &&
                        hasil.textContent.trim() !== ""
                    ) {

                        simpanHasil();


                        clearInterval(
                            intervalHasil
                        );

                    }

                },
                500
            );

    }


    /* =====================================================
       DETEKSI KLIK TOMBOL SELESAI
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


                /*
                   Cari apakah yang diklik
                   adalah tombol finishQuiz.
                */

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
                   Beberapa kemungkinan
                   tulisan tombol selesai.
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
                       Tunggu sebentar agar
                       nilai selesai dihitung.
                    */

                    setTimeout(
                        function () {

                            simpanHasil();

                        },
                        500
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
           Jangan membuat form nama.

           Jangan mengganti startQuiz.

           Kita hanya memantau startQuiz
           yang sudah ada di HTML.
        */

        pantauMulaiKuis();


        /*
           Pantau hasil kuis.
        */

        pantauHasil();


        /*
           Pantau tombol selesai.
        */

        pantauTombolSelesai();

    }


    /*
       Jalankan setelah halaman siap.
    */

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
