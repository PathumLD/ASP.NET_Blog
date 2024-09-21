using System.Text;

public class UpdateEmailDTO
{
    public string CurrentEmail { get; set; }  // The user's current email
    public string NewEmail { get; set; }      // The new email the user wants to set
    public string ConfirmNewEmail { get; set; } // The confirmation of the new email
    public string CurrentPassword { get; set; }  // The user's current password for validation
}



