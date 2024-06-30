
$(function () {

  function renderChart(task, done) {
    var chart = {
      series: [
        { name: "Total ATP", data: task },
        { name: "ATP Done", data: done },
      ],

      chart: {
        type: "bar",
        height: 345,
        offsetX: -15,
        toolbar: { show: true },
        foreColor: "#adb0bb",
        fontFamily: 'inherit',
        sparkline: { enabled: false },
      },


      colors: ["#5D87FF", "#49BEFF"],


      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "35%",
          borderRadius: [6],
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'all'
        },
      },
      markers: { size: 0 },

      dataLabels: {
        enabled: false,
      },


      legend: {
        show: false,
      },


      grid: {
        borderColor: "rgba(0,0,0,0.1)",
        strokeDashArray: 3,
        xaxis: {
          lines: {
            show: false,
          },
        },
      },

      xaxis: {
        type: "category",
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        labels: {
          style: { cssClass: "grey--text lighten-2--text fill-color" },
        },
      },

      yaxis: {
        show: true,
        // min: 0,
        // max: 50,
        tickAmount: 4,
        labels: {
          style: {
            cssClass: "grey--text lighten-2--text fill-color",
          },
          formatter: (value) => {
            return value.toFixed(0);
          },
        },
      },
      stroke: {
        show: true,
        width: 3,
        lineCap: "butt",
        colors: ["transparent"],
      },

      tooltip: { theme: "light" },

      responsive: [
        {
          breakpoint: 600,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 3,
              }
            },
          }
        }
      ]
    };

    var chart = new ApexCharts(document.querySelector("#chart"), chart);
    chart.render();
  }

  function renderStatus(series) {
    var status = {
      color: "#adb5bd",
      series: series,
      labels: ["Invitation", "Confirmation", "On Site", "Rectification", "System", "Done"],
      chart: {
        width: 180,
        type: "donut",
        fontFamily: "Plus Jakarta Sans', sans-serif",
        foreColor: "#adb0bb",
      },
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          donut: {
            size: '75%',
          },
        },
      },
      stroke: {
        show: false,
      },

      dataLabels: {
        enabled: false,
      },

      legend: {
        show: false,
      },
      colors: ["#77caed", "#698bdb", "#f5bd6e", "#f56e6e", "#474747", "#52ebb5"],

      responsive: [
        {
          breakpoint: 991,
          options: {
            chart: {
              width: 150,
            },
          },
        },
      ],
      tooltip: {
        theme: "dark",
        fillSeriesColor: false,
      },
    };

    var chart = new ApexCharts(document.querySelector("#status"), status);
    chart.render();
  }

  function renderMember(series, labels, colors) {
    var member = {
      color: "#adb5bd",
      series: series,
      labels: labels,
      chart: {
        width: 180,
        type: "donut",
        fontFamily: "Plus Jakarta Sans', sans-serif",
        foreColor: "#adb0bb",
      },
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          donut: {
            size: '75%',
          },
        },
      },
      stroke: {
        show: false,
      },

      dataLabels: {
        enabled: false,
      },

      legend: {
        show: false,
      },
      colors: colors,

      responsive: [
        {
          breakpoint: 991,
          options: {
            chart: {
              width: 150,
            },
          },
        },
      ],
      tooltip: {
        theme: "dark",
        fillSeriesColor: false,
      },
    };

    var chart = new ApexCharts(document.querySelector("#member"), member);
    chart.render();
  }

  const request = indexedDB.open('kertaskerja');
  request.onsuccess = (event) => {
    db = event.target.result;
    const objectStore = db.transaction("atp").objectStore("atp");
    objectStore.getAll().onsuccess = (event) => {
      dataAtp = event.target.result;
      const annualStatus = [];
      const annualMember = [];
      const colorsMember = [];
      const nameMember = [];
      const totalAtp = [];
      const doneAtp = [];

      for (let i = 1; i <= 12; i++) {
        const total = _.filter(dataAtp, (e) => {
          const currentYear = moment().format('YYYY');
          const date = moment(e.inviting_date);
          const year = date.format('YYYY');
          const month = date.format('M');
          return e.inviting_date && currentYear === year && month === i.toString();
        });
        const done = _.filter(total, { status: 'done' });
        totalAtp.push(total.length);
        doneAtp.push(done.length);
      }

      const annual = _.filter(dataAtp, (e) => {
        const currentYear = moment().format('YYYY');
        const date = moment(e.inviting_date);
        const year = date.format('YYYY');
        return e.inviting_date && currentYear === year;
      });

      const invitation = _.filter(annual, { status: 'invitation' });
      annualStatus.push(invitation.length);
      const confirmation = _.filter(annual, { status: 'confirmation' });
      annualStatus.push(confirmation.length);
      const on_site = _.filter(annual, { status: 'on site' });
      annualStatus.push(on_site.length);
      const rectification = _.filter(annual, (e) => {
        return e.status === 'rectification' || e.status === 'rejection';
      });
      annualStatus.push(rectification.length);
      const system = _.filter(annual, { status: 'system' });
      annualStatus.push(system.length);
      const done = _.filter(annual, { status: 'done' });
      annualStatus.push(done.length);

      let members = [];
      const userStore = db.transaction("users").objectStore("users");
      userStore.getAll().onsuccess = (e) => {
        members = e.target.result;
        members = _.filter(members, { role: 'member' });
      }

      setTimeout(() => {
        let memberList = '';
        members.forEach(d => {
          const atpMember = _.filter(annual, { email: d.email });
          const color = (Math.random() * 0xfffff * 1000000).toString(16);
          colorsMember.push('#' + color.slice(0, 6))
          annualMember.push(atpMember.length);
          nameMember.push(d.name);
          memberList += '<div class="d-flex align-items-center"><div>';
          memberList += '<span class="round-8 rounded-circle me-2 d-inline-block label-member"></span>';
          memberList += `<span class="fs-2">${d.name}</span>`;
          memberList += '</div></div>';
        });
        $('#member-list').html(memberList);
      }, 10);

      setTimeout(() => {
        renderChart(totalAtp, doneAtp);
        renderStatus(annualStatus);
        renderMember(annualMember, nameMember, colorsMember);
        $('.label-member').each(function (i, e) {
          $(this).css('background-color', colorsMember[i]);
        });
      }, 100);
    }
  };
});