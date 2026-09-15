/* =========================================================
   TIK LEARNING
   SISTEM NAMA PESERTA + TIMER + PENYIMPANAN NILAI KUIS EXCEL
   ========================================================= */

(function () {

    "use strict";

    /* =====================================================
       PENGATURAN
       ===================================================== */

    const NILAI_LULUS = 75;

    // Timer 15 menit
    const WAKTU_KUIS = 15 * 60;


    /* =====================================================
       MENENTUKAN NOMOR MODUL SECARA OTOMATIS
       
       Contoh:
       kuis-excel-1.html  → modul 1
       kuis-excel-2.html  → modul 2
       ...
       kuis-excel-11.html → modul 11
       ===================================================== */

    const namaFile = window.location.pathname;

    const hasilMatch = namaFile.match(/kuis-excel-(\d+)/i);

    if (!hasilMatch) {
        return;
    }

    const nomorModul = Number(hasilMatch[1]);

    const storageKey = "kuisExcel" + nomorModul;


    /* =====================================================
       VARIABEL
       ===================================================== */

    let namaPeserta = "";

    let timerInterval = null;

    let waktuTersisa = WAKTU_KUIS;

    let timerSudahDimulai = false;


    /* =====================================================
       MEMBUAT FORM NAMA PESERTA
       ===================================================== */

    function buatFormNama() {

        // Jangan dibuat dua kali
        if (document.getElementById("participantNameBox")) {
            return;
        }

        const box = document.createElement("div");

        box.id = "participantNameBox";

        box.innerHTML = `

            <div class="ps-overlay">

                <div class="ps-box">

                    <div class="ps-icon">
                        👤
                    </div>

                    <h2>
                        Data Peserta
                    </h2>

                    <p>
                        Masukkan nama lengkap peserta
                        sebelum memulai kuis.
                    </p>

                    <input
                        type="text"
                        id="participantName"
                        placeholder="Nama lengkap peserta"
                        autocomplete="name"
                    >

                    <button
                        type="button"
                        id="participantNameBtn"
                    >
                        Lanjut ke Kuis →
                    </button>

                    <div
                        id="participantNameError"
                        class="ps-error"
                    >
                        Nama peserta wajib diisi.
                    </div>

                </div>

            </div>

        `;

        document.body.appendChild(box);


        /* Tombol lanjut */

        document
            .getElementById("participantNameBtn")
            .addEventListener(
                "click",
                konfirmasiNama
            );


        /* Enter */

        document
            .getElementById("participantName")
            .addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Enter") {

                        konfirmasiNama();

                    }

                }
            );


        /* Jika nama sudah pernah disimpan */

        const namaTersimpan =
            localStorage.getItem("namaPeserta");

        if (namaTersimpan) {

            document
                .getElementById("participantName")
                .value = namaTersimpan;

        }

    }


    /* =====================================================
       KONFIRMASI NAMA
       ===================================================== */

    function konfirmasiNama() {

        const input =
            document.getElementById(
                "participantName"
            );

        const error =
            document.getElementById(
                "participantNameError"
            );

        const nama =
            input.value.trim();


        if (!nama) {

            error.style.display = "block";

            input.focus();

            return;

        }


        namaPeserta = nama;


        /* Simpan nama peserta */

        localStorage.setItem(
            "namaPeserta",
            namaPeserta
        );

        sessionStorage.setItem(
            "namaPeserta",
            namaPeserta
        );


        /* Tutup form */

        document
            .getElementById(
                "participantNameBox"
            )
            .remove();


        /* Jalankan fungsi asli */

        fungsiMulaiAsli();


        /* Mulai timer */

        mulaiTimer();

    }


    /* =====================================================
       MEMBUAT TIMER
       ===================================================== */

    function buatTimer() {

        if (
            document.getElementById(
                "quizTimer"
            )
        ) {
            return;
        }


        const timer =
            document.createElement("div");

        timer.id = "quizTimer";


        timer.innerHTML = `

            <div class="ps-timer">

                ⏱️ Sisa Waktu:

                <strong id="quizTimerText">
                    15:00
                </strong>

            </div>

        `;


        /*
           Mencari elemen kuis.
           Sistem mencoba beberapa ID agar
           lebih fleksibel dengan kode kuis.
        */

        const tempatTimer =
            document.getElementById("quizCard") ||
            document.getElementById("quizSection") ||
            document.querySelector(".quiz-container") ||
            document.querySelector(".quiz");


        if (tempatTimer) {

            tempatTimer.insertBefore(
                timer,
                tempatTimer.firstChild
            );

        } else {

            document.body.insertBefore(
                timer,
                document.body.firstChild
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

        timerSudahDimulai = true;


        buatTimer();

        updateTimer();


        timerInterval =
            setInterval(
                function () {

                    waktuTersisa--;

                    updateTimer();


                    /*
                       Waktu habis
                    */

                    if (waktuTersisa <= 0) {

                        clearInterval(
                            timerInterval
                        );


                        alert(
                            "⏰ Waktu kuis telah habis. " +
                            "Jawaban akan dikumpulkan otomatis."
                        );


                        /*
                           Jalankan submit asli
                        */

                        fungsiSelesaiAsli();


                        /*
                           Tunggu hasil dihitung
                        */

                        setTimeout(
                            simpanHasil,
                            300
                        );

                    }

                },
                1000
            );

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

            String(menit).padStart(2, "0")
            + ":"
            +
            String(detik).padStart(2, "0");


        /*
           Peringatan ketika tersisa
           kurang dari 1 menit
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
       MENCARI NILAI HASIL KUIS
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


            if (element) {

                const angka =
                    Number(
                        element
                            .textContent
                            .replace(
                                /[^\d.-]/g,
                                ""
                            )
                    );


                if (!isNaN(angka)) {

                    return angka;

                }

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


            if (element) {

                const angka =
                    Number(
                        element.textContent
                            .replace(
                                /[^\d.-]/g,
                                ""
                            )
                    );


                if (!isNaN(angka)) {

                    return angka;

                }

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


            if (element) {

                const angka =
                    Number(
                        element.textContent
                            .replace(
                                /[^\d.-]/g,
                                ""
                            )
                    );


                if (!isNaN(angka)) {

                    return angka;

                }

            }

        }


        return 0;

    }


    /* =====================================================
       MENYIMPAN HASIL KUIS
       ===================================================== */

    function simpanHasil() {

        const nilai =
            ambilNilai();


        const benar =
            ambilBenar();


        const salah =
            ambilSalah();


        /*
           Jika nama belum ditemukan,
           ambil dari penyimpanan browser
        */

        if (!namaPeserta) {

            namaPeserta =
                localStorage.getItem(
                    "namaPeserta"
                ) ||
                sessionStorage.getItem(
                    "namaPeserta"
                ) ||
                "Peserta";

        }


        /*
           Tentukan status
        */

        let status;


        if (
            nilai >= NILAI_LULUS
        ) {

            status = "LULUS";

        } else {

            status = "BELUM LULUS";

        }


        /*
           Data yang disimpan
        */

        const dataKuis = {

            modul: nomorModul,

            nama: namaPeserta,

            nilai: nilai,

            benar: benar,

            salah: salah,

            selesai: true,

            status: status,

            tanggal:
                new Date()
                    .toLocaleString(
                        "id-ID"
                    )

        };


        /*
           Simpan berdasarkan nomor modul
           
           Modul 1:
           kuisExcel1

           Modul 2:
           kuisExcel2

           dst.
        */

        localStorage.setItem(

            storageKey,

            JSON.stringify(
                dataKuis
            )

        );


        /*
           Simpan nama secara global
        */

        localStorage.setItem(
            "namaPeserta",
            namaPeserta
        );


        /*
           Hentikan timer
        */

        if (timerInterval) {

            clearInterval(
                timerInterval
            );

        }


        /*
           Tambahkan tombol
           menuju perkembangan
        */

        tambahTombolPerkembangan();

    }


    /* =====================================================
       TOMBOL MENUJU PERKEMBANGAN
       ===================================================== */

    function tambahTombolPerkembangan() {

        /*
           Jangan dibuat dua kali
        */

        if (
            document.getElementById(
                "progressLink"
            )
        ) {

            return;

        }


        /*
           Cari bagian hasil
        */

        const hasil =
            document.getElementById(
                "result"
            ) ||
            document.getElementById(
                "resultSection"
            ) ||
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
       AMBIL FUNGSI ASLI KUIS
       ===================================================== */

    const fungsiMulaiAsli =
        typeof window.startQuiz === "function"

            ? window.startQuiz

            : function () {};


    const fungsiSelesaiAsli =
        typeof window.finishQuiz === "function"

            ? window.finishQuiz

            : function () {};


    /* =====================================================
       GANTI FUNGSI START QUIZ
       ===================================================== */

    window.startQuiz =
        function () {

            buatFormNama();

        };


    /* =====================================================
       GANTI FUNGSI FINISH QUIZ
       ===================================================== */

    window.finishQuiz =
        function () {

            fungsiSelesaiAsli();


            /*
               Tunggu hasil nilai tampil
            */

            setTimeout(
                simpanHasil,
                300
            );

        };


    /* =====================================================
       CSS
       ===================================================== */

    const style =
        document.createElement(
            "style"
        );


    style.textContent = `

        /* =========================
           FORM NAMA PESERTA
           ========================= */

        .ps-overlay {

            position: fixed;

            inset: 0;

            z-index: 99999;

            display: flex;

            align-items: center;

            justify-content: center;

            padding: 20px;

            background:
                rgba(
                    16,
                    124,
                    65,
                    0.96
                );

        }


        .ps-box {

            width: 100%;

            max-width: 430px;

            background: #ffffff;

            border-radius: 18px;

            padding: 32px;

            text-align: center;

            box-shadow:
                0 15px 45px
                rgba(
                    0,
                    0,
                    0,
                    0.25
                );

        }


        .ps-icon {

            font-size: 48px;

            margin-bottom: 8px;

        }


        .ps-box h2 {

            color: #107c41;

            margin:
                0 0 8px;

        }


        .ps-box p {

            color: #607d8b;

            line-height: 1.5;

            margin-bottom: 18px;

        }


        .ps-box input {

            width: 100%;

            padding:
                13px 15px;

            border:
                2px solid
                #dfe5e8;

            border-radius: 9px;

            font-size: 16px;

            outline: none;

            margin-bottom: 12px;

        }


        .ps-box input:focus {

            border-color:
                #107c41;

        }


        .ps-box button {

            width: 100%;

            border: none;

            padding: 13px;

            border-radius: 9px;

            background:
                #107c41;

            color: #ffffff;

            font-size: 15px;

            font-weight: 700;

            cursor: pointer;

        }


        .ps-box button:hover {

            background:
                #0b5c30;

        }


        .ps-error {

            display: none;

            margin-top: 10px;

            padding: 9px;

            border-radius: 7px;

            background:
                #fff0f0;

            color:
                #d32f2f;

            font-size: 13px;

        }


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
           TOMBOL PROGRESS
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


})();