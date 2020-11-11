KPL/MK

   This meta-kernel lists the MSL SPICE kernels needed for the CHRONOS
   time conversion application. All of the kernels listed below are
   archived in the MSL SPICE data set (DATA_SET_ID =
   "MSL-M-SPICE-6-V1.0"). This set of files and the order in which they
   are listed were picked to provide the best available data and the
   most complete coverage based on the information about the kernels
   available at the time this meta-kernel was made. For detailed
   information about the kernels listed below refer to the internal
   comments included in the kernels and the documentation accompanying
   the MSL SPICE data set.

   It is recommended that users make a local copy of this file and
   modify the value of the PATH_VALUES keyword to point to the actual
   location of the MSL SPICE data set's ``data'' directory on their
   system. Replacing ``/'' with ``\'' and converting line terminators
   to the format native to the user's system may also be required if
   this meta-kernel is to be used on a non-UNIX workstation.

   This file was created on December 2, 2019 by Boris Semenov, NAIF/JPL.
   The original name of this file was msl_chronos_v07.tm.

   \begindata

      PATH_VALUES        = ( './data' )

      PATH_SYMBOLS       = ( 'KERNELS' )

      KERNELS_TO_LOAD    = (

                          '$KERNELS/lsk/naif0012.tls'

                          '$KERNELS/sclk/msl_76_sclkscet_00016.tsc'
                          '$KERNELS/sclk/msl_lmst_ops120808_v1.tsc'

                          '$KERNELS/pck/pck00008.tpc'

                          '$KERNELS/spk/de425s.bsp'
                          '$KERNELS/spk/msl_cruise_v1.bsp'
                          '$KERNELS/spk/msl_edl_v01.bsp'
                          '$KERNELS/spk/msl_ls_ops120808_iau2000_v1.bsp'
                          '$KERNELS/spk/msl_atls_ops120808_v1.bsp'

                          '$KERNELS/fk/msl_v08.tf'

                           )

      SPACECRAFT_ID      = -76
      CENTER_ID          = 499
      LANDING_TIME       = '2012-08-06T05:17:57'
      LANDING_SOL_INDEX  = 0

      BODY10_GM          = 132712440035.0199

   \begintext

End of MK file.
